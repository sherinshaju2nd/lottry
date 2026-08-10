import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { WEEKLY_LOTTERIES } from "../constants/lotteries";
import { fetchAllDraws, DrawResult, searchTicketNumber, SearchMatch, supabase } from "../api/lotteryApi";

export default function HomeScreen({ navigation }: any) {
  const [allDraws, setAllDraws] = useState<DrawResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hero Section Tab: 0 = Today's Draw, 1 = Yesterday's Result
  const [heroTab, setHeroTab] = useState<number>(0);

  // Quick Ticket Checker State
  const [ticketInput, setTicketInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchMatch[] | null>(null);

  const loadData = async () => {
    try {
      const draws = await fetchAllDraws();
      setAllDraws(draws);
    } catch {
      setAllDraws([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Realtime listener for live cron job updates
    const channel = supabase
      .channel("realtime-mobile-home")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "draw_results" },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleQuickCheck = async () => {
    if (!ticketInput.trim()) return;
    setIsChecking(true);
    try {
      const matches = await searchTicketNumber(ticketInput.trim());
      setSearchResults(matches);
    } catch {
      setSearchResults([]);
    } finally {
      setIsChecking(false);
    }
  };

  // Identify Today's Draw and Yesterday's/Previous Draw
  const todayDraw = allDraws.length > 0 ? allDraws[0] : null;
  const previousDraw = allDraws.length > 1 ? allDraws[1] : null;

  // Active draw based on selected hero tab
  const activeDraw = heroTab === 0 ? todayDraw : previousDraw;

  // Map latest draw per lottery code for weekly schedule cards
  const recentDrawsMap: Record<string, DrawResult> = {};
  allDraws.forEach((d) => {
    if (!recentDrawsMap[d.lottery_code]) {
      recentDrawsMap[d.lottery_code] = d;
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
      >
        {/* App Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="ticket-outline" size={20} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.appName}>Kerala Lottery Results</Text>
              <Text style={styles.appSubtitle}>Live Official Updates & Checker</Text>
            </View>
          </View>
        </View>

        {/* Hero Tab Switcher: Today's Draw vs Yesterday's Result */}
        {allDraws.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heroTabScrollView}>
            <View style={styles.heroTabBar}>
              <TouchableOpacity
                style={[styles.heroTab, heroTab === 0 && styles.heroTabActiveGreen]}
                onPress={() => setHeroTab(0)}
              >
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={heroTab === 0 ? COLORS.white : COLORS.primary}
                />
                <Text style={[styles.heroTabText, heroTab === 0 && styles.heroTabActiveText]}>
                  Today&apos;s Draw ({todayDraw ? `${todayDraw.draw_name} ${todayDraw.lottery_code}` : "Today"})
                </Text>
              </TouchableOpacity>

              {previousDraw && (
                <TouchableOpacity
                  style={[styles.heroTab, heroTab === 1 && styles.heroTabActiveGold]}
                  onPress={() => setHeroTab(1)}
                >
                  <Ionicons
                    name="trophy-outline"
                    size={14}
                    color={heroTab === 1 ? COLORS.white : COLORS.gold}
                  />
                  <Text style={[styles.heroTabText, heroTab === 1 && styles.heroTabActiveText]}>
                    Yesterday&apos;s Result ({previousDraw.draw_date})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}

        {/* Active Draw 1st Prize Winner Highlight Card */}
        {activeDraw && (
          <View style={[styles.winnerCard, heroTab === 1 && styles.winnerCardGold]}>
            <View style={styles.winnerHeader}>
              <Ionicons name="trophy" size={16} color={heroTab === 1 ? COLORS.gold : COLORS.successText} />
              <Text style={[styles.winnerTextBadge, heroTab === 1 && { color: COLORS.gold }]}>
                {heroTab === 0 ? `LATEST DRAW • ${activeDraw.draw_date}` : `PREVIOUS DRAW • ${activeDraw.draw_date}`}
              </Text>
            </View>

            <Text style={styles.winnerTitle}>{activeDraw.draw_name} ({activeDraw.draw_code})</Text>
            <Text style={[styles.winnerPrizeLabel, heroTab === 0 && { color: COLORS.primary }]}>
              1ST PRIZE ({activeDraw.prizes?.amounts?.["1st"] || "₹70 Lakhs"})
            </Text>

            <Text style={[styles.winnerTicketNumber, heroTab === 1 && { color: COLORS.gold }]}>
              {activeDraw.first?.ticket || "N/A"}
            </Text>

            {activeDraw.first?.location && (
              <Text style={styles.winnerMeta}>
                Location: <Text style={styles.boldText}>{activeDraw.first.location}</Text>
                {activeDraw.first?.agent ? `  |  Agent: ${activeDraw.first.agent}` : ""}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.viewBreakdownBtn, heroTab === 1 && { backgroundColor: COLORS.goldLight }]}
              onPress={() =>
                navigation.navigate("DrawBreakdown", {
                  code: activeDraw.lottery_code,
                  date: activeDraw.draw_date,
                })
              }
            >
              <Text style={[styles.viewBreakdownText, heroTab === 1 && { color: COLORS.gold }]}>
                View Full Breakdown for {activeDraw.draw_date} →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Ticket Checker Card */}
        <View style={styles.checkerCard}>
          <View style={styles.checkerTitleRow}>
            <Ionicons name="search" size={18} color={COLORS.primary} />
            <Text style={styles.checkerTitle}>
              {heroTab === 0 ? "Check Today's Ticket" : "Check Previous Draw Ticket"}
            </Text>
          </View>

          <Text style={styles.checkerSubtitle}>
            {activeDraw
              ? `Check ticket number against ${activeDraw.draw_name} (${activeDraw.draw_code}) result from ${activeDraw.draw_date}.`
              : "Enter your 6-digit ticket number below."}
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={activeDraw ? `Enter 6-digit ticket for ${activeDraw.draw_code}...` : "Enter ticket (e.g. BT 263322)"}
              placeholderTextColor={COLORS.textLight}
              value={ticketInput}
              onChangeText={setTicketInput}
              keyboardType="default"
              autoCapitalize="characters"
            />

            <TouchableOpacity
              style={[styles.checkButton, heroTab === 1 && { backgroundColor: COLORS.gold }]}
              onPress={handleQuickCheck}
              disabled={isChecking}
            >
              {isChecking ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.checkButtonText}>Check Now</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Search Result Display */}
          {searchResults !== null && (
            <View style={styles.searchResultsContainer}>
              {searchResults.length > 0 ? (
                searchResults.map((m, idx) => (
                  <View key={idx} style={styles.matchItem}>
                    <Text style={styles.matchPrize}>🎉 {m.prize_tier}: {m.prize_amount || ""}</Text>
                    <Text style={styles.matchDetail}>
                      {m.draw_name} ({m.draw_code}) on {m.draw_date} • Ticket: {m.ticket_matched}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noMatchText}>
                  No winning prize match found for &quot;{ticketInput}&quot;. Try checking all lotteries.
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Weekly Schedule Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Lottery Schedule</Text>
          <Text style={styles.sectionSubtitle}>Daily draws conducted by Kerala State Lotteries Dept</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.scheduleGrid}>
            {WEEKLY_LOTTERIES.map((lottery) => {
              const latest = recentDrawsMap[lottery.code];
              return (
                <TouchableOpacity
                  key={lottery.code}
                  style={styles.lotteryCard}
                  onPress={() => navigation.navigate("LotteryArchive", { code: lottery.code })}
                >
                  <View style={styles.lotteryCardTop}>
                    <View style={styles.dayChip}>
                      <Text style={styles.dayChipText}>{lottery.day}</Text>
                    </View>
                    <View style={styles.codeChip}>
                      <Text style={styles.codeChipText}>{lottery.code}</Text>
                    </View>
                  </View>

                  <Text style={styles.lotteryName}>{lottery.name}</Text>
                  <Text style={styles.drawTimeText}>Official Draw: 3:00 PM</Text>

                  {latest ? (
                    <View style={styles.latestHighlight}>
                      <View style={styles.latestHeaderRow}>
                        <Text style={styles.highlightLabel}>LATEST 1ST PRIZE</Text>
                        <Text style={styles.highlightDate}>{latest.draw_date}</Text>
                      </View>
                      <Text style={styles.highlightTicket}>{latest.first?.ticket || "N/A"}</Text>
                    </View>
                  ) : (
                    <View style={styles.archiveNoticeBox}>
                      <Text style={styles.archiveNotice}>Daily 3:10 PM Updates</Text>
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <Text style={styles.footerText}>View Archives & Results</Text>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 12 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 18, fontWeight: "800", color: COLORS.primary },
  appSubtitle: { fontSize: 12, color: COLORS.textMuted, fontWeight: "500" },
  heroTabScrollView: { marginBottom: 14 },
  heroTabBar: { flexDirection: "row", gap: 8 },
  heroTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroTabActiveGreen: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  heroTabActiveGold: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  heroTabText: { fontSize: 12, fontWeight: "700", color: COLORS.textDark },
  heroTabActiveText: { color: COLORS.white, fontWeight: "800" },
  winnerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  winnerCardGold: {
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
  },
  winnerHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  winnerTextBadge: { fontSize: 12, fontWeight: "800", color: COLORS.successText },
  winnerTitle: { fontSize: 20, fontWeight: "900", color: COLORS.textDark, marginBottom: 4 },
  winnerPrizeLabel: { fontSize: 12, fontWeight: "800", color: COLORS.gold, marginBottom: 6 },
  winnerTicketNumber: { fontSize: 26, fontWeight: "900", fontFamily: "monospace", color: COLORS.primary, marginBottom: 8 },
  winnerMeta: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  boldText: { fontWeight: "700", color: COLORS.textDark },
  viewBreakdownBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  viewBreakdownText: { fontSize: 13, fontWeight: "800", color: COLORS.primary },
  checkerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  checkerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  checkerTitle: { fontSize: 16, fontWeight: "800", color: COLORS.textDark },
  checkerSubtitle: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  inputRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.textDark,
    backgroundColor: COLORS.background,
  },
  checkButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkButtonText: { color: COLORS.white, fontWeight: "800", fontSize: 13 },
  searchResultsContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  matchItem: { backgroundColor: COLORS.primaryLight, padding: 10, borderRadius: 8, marginBottom: 6 },
  matchPrize: { fontSize: 14, fontWeight: "800", color: COLORS.primary },
  matchDetail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  noMatchText: { fontSize: 13, color: COLORS.textMuted, fontStyle: "italic" },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textDark },
  sectionSubtitle: { fontSize: 12, color: COLORS.textMuted },
  scheduleGrid: { gap: 12 },
  lotteryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lotteryCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  dayChip: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dayChipText: { fontSize: 12, fontWeight: "800", color: COLORS.primary },
  codeChip: { backgroundColor: COLORS.chipBlueBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  codeChipText: { fontSize: 11, fontWeight: "900", color: COLORS.chipBlueText },
  lotteryName: { fontSize: 16, fontWeight: "800", color: COLORS.textDark },
  drawTimeText: { fontSize: 12, color: COLORS.textMuted, marginBottom: 10 },
  latestHighlight: { backgroundColor: COLORS.goldLight, padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: COLORS.goldBorder },
  latestHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  highlightLabel: { fontSize: 10, fontWeight: "800", color: COLORS.gold },
  highlightDate: { fontSize: 10, fontWeight: "700", color: COLORS.gold },
  highlightTicket: { fontSize: 16, fontWeight: "900", fontFamily: "monospace", color: COLORS.gold },
  archiveNoticeBox: { backgroundColor: COLORS.background, padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  archiveNotice: { fontSize: 11, color: COLORS.textMuted, fontStyle: "italic" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.background },
  footerText: { fontSize: 12, fontWeight: "800", color: COLORS.primary },
});
