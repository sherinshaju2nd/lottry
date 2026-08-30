"use client";

import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";

// Icons
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SettingsIcon from "@mui/icons-material/Settings";
import TableChartIcon from "@mui/icons-material/TableChart";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CampaignIcon from "@mui/icons-material/Campaign";
import TelegramIcon from "@mui/icons-material/Telegram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SendIcon from "@mui/icons-material/Send";

import TableSkeleton from "@/components/skeletons/TableSkeleton";
import AiGazettePdfUploader from "@/components/admin/AiGazettePdfUploader";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
  StructuredDrawResult,
  PostponedDraw,
  LotteryRecord,
  CronLog,
  CronConfig,
  saveDrawResultToSupabase,
  ALL_LOTTERIES,
} from "@/lib/supabase";

export default function AdminDashboardPage() {
  const [currentTab, setCurrentTab] = useState<number>(0);

  // Tab 0: Draws state
  const [draws, setDraws] = useState<StructuredDrawResult[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error" | "warning" | "info"; message: string } | null>(null);
  const [isLoadingDraws, setIsLoadingDraws] = useState(true);
  const [searchDrawTerm, setSearchDrawTerm] = useState("");

  // Draw Result Dialog (Add / Edit)
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [editingDraw, setEditingDraw] = useState<StructuredDrawResult | null>(null);
  const [drawFormData, setDrawFormData] = useState({
    id: undefined as number | undefined,
    draw_date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
    draw_name: "Bhagyathara",
    draw_code: "BT-120",
    lottery_code: "BT",
    first_ticket: "",
    first_location: "",
    first_agent: "",
    first_amount: "1,00,00,000/-",
    consolation_tickets: "",
    consolation_amount: "8,000/-",
    second_tickets: "",
    second_amount: "10,00,000/-",
    third_tickets: "",
    third_amount: "1,00,000/-",
    fourth_tickets: "",
    fourth_amount: "5,000/-",
    fifth_tickets: "",
    fifth_amount: "1,000/-",
    sixth_tickets: "",
    sixth_amount: "500/-",
    seventh_tickets: "",
    seventh_amount: "100/-",
    eighth_tickets: "",
    eighth_amount: "50/-",
  });

  // AI PDF Ingestion State
  const [aiPdfModalOpen, setAiPdfModalOpen] = useState(false);

  // Tab 1: Postponed / Blackout Dates state
  const [postponedList, setPostponedList] = useState<PostponedDraw[]>([]);
  const [isLoadingPostponed, setIsLoadingPostponed] = useState(true);
  const [postponeModalOpen, setPostponeModalOpen] = useState(false);
  const [postponeFormData, setPostponeFormData] = useState({
    id: undefined as number | undefined,
    draw_date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
    lottery_code: "ALL",
    status: "postponed",
    reason: "",
    rescheduled_date: "",
    disable_cron: true,
  });

  // Tab 2: Bumper Lotteries state
  const [lotteriesList, setLotteriesList] = useState<LotteryRecord[]>([]);
  const [isLoadingLotteries, setIsLoadingLotteries] = useState(true);
  const [lotteryModalOpen, setLotteryModalOpen] = useState(false);
  const [lotteryFormData, setLotteryFormData] = useState({
    id: undefined as number | undefined,
    name: "",
    name_ml: "",
    code: "",
    day: "",
    draw_time: "2:00 PM",
    is_bumper: true,
    jackpot: "₹10 Crore",
    ticket_price: "₹300",
    draw_date: "",
    draw_season: "",
  });

  // Tab 3: Cron & Automation Settings state
  const [cronConfig, setCronConfig] = useState<CronConfig>({
    cron_enabled: true,
    cron_start_time: "15:00",
    cron_phase1_end_time: "16:00",
    cron_end_time: "17:00",
    cron_frequency_mins: "1",
    cron_phase2_frequency_mins: "5",
    cron_bumper_start_time: "14:00",
    cron_bumper_phase1_end_time: "16:00",
    cron_bumper_end_time: "18:00",
    cron_bumper_frequency_mins: "1",
    cron_bumper_phase2_frequency_mins: "5",
    app_url: "https://www.keralalotteryresultstoday.in",
    cron_secret: "kerala_lottery_cron_secret_2026",
  });
  const [cronLogs, setCronLogs] = useState<CronLog[]>([]);
  const [isBumperToday, setIsBumperToday] = useState(false);
  const [todayBumperInfo, setTodayBumperInfo] = useState<any>(null);
  const [isLoadingCron, setIsLoadingCron] = useState(true);
  const [isTestingCron, setIsTestingCron] = useState(false);
  const [isSavingCronConfig, setIsSavingCronConfig] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Load Data
  const loadDraws = async () => {
    setIsLoadingDraws(true);
    try {
      const res = await fetch("/api/draws?type=all");
      const json = await res.json();
      setDraws(json.results || []);
    } catch {
      setDraws([]);
    } finally {
      setIsLoadingDraws(false);
    }
  };

  const loadPostponed = async () => {
    setIsLoadingPostponed(true);
    try {
      const res = await fetch("/api/admin/postponed");
      const json = await res.json();
      setPostponedList(json.list || []);
    } catch {
      setPostponedList([]);
    } finally {
      setIsLoadingPostponed(false);
    }
  };

  const loadLotteries = async () => {
    setIsLoadingLotteries(true);
    try {
      const res = await fetch("/api/admin/lotteries");
      const json = await res.json();
      setLotteriesList(json.lotteries || []);
    } catch {
      setLotteriesList([]);
    } finally {
      setIsLoadingLotteries(false);
    }
  };

  const loadCronConfigAndLogs = async () => {
    setIsLoadingCron(true);
    try {
      const res = await fetch("/api/admin/cron-config");
      const json = await res.json();
      if (json.config) setCronConfig(json.config);
      if (json.logs) setCronLogs(json.logs || []);
      setIsBumperToday(Boolean(json.is_bumper_today));
      setTodayBumperInfo(json.today_bumper_info || null);
    } catch {
      // ignore
    } finally {
      setIsLoadingCron(false);
    }
  };

  // Tab 4: 1st Prize Broadcast State
  const [broadcastStatus, setBroadcastStatus] = useState<any>(null);
  const [isLoadingBroadcast, setIsLoadingBroadcast] = useState(false);
  const [isTestingTg, setIsTestingTg] = useState(false);
  const [isTestingWa, setIsTestingWa] = useState(false);
  const [isBroadcastingManual, setIsBroadcastingManual] = useState(false);
  const [selectedBroadcastDrawDate, setSelectedBroadcastDrawDate] = useState<string>("");

  const loadBroadcastStatus = async () => {
    setIsLoadingBroadcast(true);
    try {
      const res = await fetch("/api/admin/broadcast");
      const json = await res.json();
      if (json.success) setBroadcastStatus(json.status);
    } catch {
      // ignore
    } finally {
      setIsLoadingBroadcast(false);
    }
  };

  const handleTestTelegram = async () => {
    setIsTestingTg(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_telegram" }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncStatus({ type: "success", message: "✅ Telegram test broadcast sent successfully to your channel/group!" });
      } else {
        setSyncStatus({ type: "error", message: `Telegram test failed: ${json.error || "Please check TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env"}` });
      }
    } catch (e: any) {
      setSyncStatus({ type: "error", message: e.message || "Telegram test error" });
    } finally {
      setIsTestingTg(false);
      await loadBroadcastStatus();
    }
  };

  const handleTestWhatsApp = async () => {
    setIsTestingWa(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_whatsapp" }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncStatus({ type: "success", message: "✅ WhatsApp test message sent successfully to your group/channel!" });
      } else {
        setSyncStatus({ type: "error", message: `WhatsApp test failed: ${json.error || "Please check WHATSAPP_API_URL / WHATSAPP_API_TOKEN in .env"}` });
      }
    } catch (e: any) {
      setSyncStatus({ type: "error", message: e.message || "WhatsApp test error" });
    } finally {
      setIsTestingWa(false);
      await loadBroadcastStatus();
    }
  };

  const handleBroadcastDrawNow = async (drawDate: string, lotteryCode: string) => {
    if (!drawDate || !lotteryCode) return;
    setIsBroadcastingManual(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "broadcast_draw", draw_date: drawDate, lottery_code: lotteryCode, force: true }),
      });
      const json = await res.json();
      if (json.success && json.result?.broadcastTriggered) {
        setSyncStatus({ type: "success", message: `🎉 1st Prize for ${drawDate} successfully broadcasted to Telegram and WhatsApp!` });
      } else {
        setSyncStatus({ type: "info", message: json.result?.reason || json.error || "Broadcast action completed." });
      }
    } catch (e: any) {
      setSyncStatus({ type: "error", message: e.message || "Broadcast error" });
    } finally {
      setIsBroadcastingManual(false);
      await loadBroadcastStatus();
    }
  };

  useEffect(() => {
    loadDraws();
    loadPostponed();
    loadLotteries();
    loadCronConfigAndLogs();
    loadBroadcastStatus();
  }, []);

  // Sync Latest API Result
  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const json = await res.json();

      if (json.success) {
        setSyncStatus({
          type: "success",
          message: `Manual sync completed! Synced: ${json.data?.draw_name} (${json.data?.draw_code}) on ${json.data?.draw_date}`,
        });
        await loadDraws();
        await loadCronConfigAndLogs();
        return;
      }

      // Fallback direct indialotteryapi client fetch
      const apiRes = await fetch("https://indialotteryapi.com/wp-json/klr/v1/latest");
      const directJson = await apiRes.json();

      if (directJson && directJson.draw_date && directJson.draw_code) {
        await saveDrawResultToSupabase({
          draw_date: directJson.draw_date,
          draw_name: directJson.draw_name || "Kerala Lottery",
          draw_code: directJson.draw_code,
          first: directJson.first || {},
          prizes: directJson.prizes || {},
        });

        setSyncStatus({
          type: "success",
          message: `Direct API sync completed! Synced: ${directJson.draw_name} (${directJson.draw_code}) on ${directJson.draw_date}`,
        });
        await loadDraws();
        await loadCronConfigAndLogs();
      } else {
        setSyncStatus({
          type: "error",
          message: json.error || "Failed to parse API response structure.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync connection error";
      setSyncStatus({ type: "error", message: `Sync error: ${msg}` });
    } finally {
      setIsSyncing(false);
    }
  };

  // -------------------------------------------------------------
  // Draw Result Handlers
  // -------------------------------------------------------------
  const openNewDrawModal = () => {
    setEditingDraw(null);
    setDrawFormData({
      id: undefined,
      draw_date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
      draw_name: "Bhagyathara",
      draw_code: "BT-120",
      lottery_code: "BT",
      first_ticket: "",
      first_location: "",
      first_agent: "",
      first_amount: "1,00,00,000/-",
      consolation_tickets: "",
      consolation_amount: "8,000/-",
      second_tickets: "",
      second_amount: "10,00,000/-",
      third_tickets: "",
      third_amount: "1,00,000/-",
      fourth_tickets: "",
      fourth_amount: "5,000/-",
      fifth_tickets: "",
      fifth_amount: "1,000/-",
      sixth_tickets: "",
      sixth_amount: "500/-",
      seventh_tickets: "",
      seventh_amount: "100/-",
      eighth_tickets: "",
      eighth_amount: "50/-",
    });
    setDrawModalOpen(true);
  };

  const openEditDrawModal = (draw: StructuredDrawResult) => {
    setEditingDraw(draw);
    const parseList = (arr?: string[]) => (Array.isArray(arr) ? arr.join(", ") : "");
    setDrawFormData({
      id: draw.id,
      draw_date: draw.draw_date,
      draw_name: draw.draw_name,
      draw_code: draw.draw_code,
      lottery_code: draw.lottery_code,
      first_ticket: draw.first?.ticket || "",
      first_location: draw.first?.location || "",
      first_agent: draw.first?.agent || "",
      first_amount: draw.prizes?.amounts?.["1st"] || "1,00,00,000/-",
      consolation_tickets: parseList(draw.prizes?.consolation),
      consolation_amount: draw.prizes?.amounts?.["consolation"] || "8,000/-",
      second_tickets: parseList(draw.prizes?.["2nd"]),
      second_amount: draw.prizes?.amounts?.["2nd"] || "10,00,000/-",
      third_tickets: parseList(draw.prizes?.["3rd"]),
      third_amount: draw.prizes?.amounts?.["3rd"] || "1,00,000/-",
      fourth_tickets: parseList(draw.prizes?.["4th"]),
      fourth_amount: draw.prizes?.amounts?.["4th"] || "5,000/-",
      fifth_tickets: parseList(draw.prizes?.["5th"]),
      fifth_amount: draw.prizes?.amounts?.["5th"] || "1,000/-",
      sixth_tickets: parseList(draw.prizes?.["6th"]),
      sixth_amount: draw.prizes?.amounts?.["6th"] || "500/-",
      seventh_tickets: parseList(draw.prizes?.["7th"]),
      seventh_amount: draw.prizes?.amounts?.["7th"] || "100/-",
      eighth_tickets: parseList(draw.prizes?.["8th"]),
      eighth_amount: draw.prizes?.amounts?.["8th"] || "50/-",
    });
    setDrawModalOpen(true);
  };

  const handleAiPdfResultExtracted = (drawData: StructuredDrawResult) => {
    const parseList = (arr?: string[]) => (Array.isArray(arr) ? arr.join(", ") : "");
    setEditingDraw(null);
    setDrawFormData({
      id: undefined,
      draw_date: drawData.draw_date || new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
      draw_name: drawData.draw_name || "Kerala Lottery",
      draw_code: drawData.draw_code || "KL-000",
      lottery_code: drawData.lottery_code || "KR",
      first_ticket: drawData.first?.ticket || "",
      first_location: drawData.first?.location || "",
      first_agent: drawData.first?.agent || "",
      first_amount: drawData.prizes?.amounts?.["1st"] || "1,00,00,000/-",
      consolation_tickets: parseList(drawData.prizes?.consolation),
      consolation_amount: drawData.prizes?.amounts?.["consolation"] || "8,000/-",
      second_tickets: parseList(drawData.prizes?.["2nd"]),
      second_amount: drawData.prizes?.amounts?.["2nd"] || "10,00,000/-",
      third_tickets: parseList(drawData.prizes?.["3rd"]),
      third_amount: drawData.prizes?.amounts?.["3rd"] || "1,00,000/-",
      fourth_tickets: parseList(drawData.prizes?.["4th"]),
      fourth_amount: drawData.prizes?.amounts?.["4th"] || "5,000/-",
      fifth_tickets: parseList(drawData.prizes?.["5th"]),
      fifth_amount: drawData.prizes?.amounts?.["5th"] || "1,000/-",
      sixth_tickets: parseList(drawData.prizes?.["6th"]),
      sixth_amount: drawData.prizes?.amounts?.["6th"] || "500/-",
      seventh_tickets: parseList(drawData.prizes?.["7th"]),
      seventh_amount: drawData.prizes?.amounts?.["7th"] || "100/-",
      eighth_tickets: parseList(drawData.prizes?.["8th"]),
      eighth_amount: drawData.prizes?.amounts?.["8th"] || "50/-",
    });
    setDrawModalOpen(true);
    setSyncStatus({
      type: "success",
      message: `Gemini AI extracted Gazette results for ${drawData.draw_name} (${drawData.draw_code}). Please review and click Save!`,
    });
  };

  const handleSaveDrawResult = async () => {
    const parseTickets = (raw: string) =>
      raw
        .split(/[,\s\n]+/)
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);

    const payload: StructuredDrawResult = {
      id: drawFormData.id,
      draw_date: drawFormData.draw_date,
      draw_name: drawFormData.draw_name,
      draw_code: drawFormData.draw_code.toUpperCase(),
      lottery_code: drawFormData.lottery_code.toUpperCase(),
      first: {
        ticket: drawFormData.first_ticket.trim().toUpperCase(),
        location: drawFormData.first_location.trim(),
        agent: drawFormData.first_agent.trim(),
      },
      prizes: {
        consolation: parseTickets(drawFormData.consolation_tickets),
        "2nd": parseTickets(drawFormData.second_tickets),
        "3rd": parseTickets(drawFormData.third_tickets),
        "4th": parseTickets(drawFormData.fourth_tickets),
        "5th": parseTickets(drawFormData.fifth_tickets),
        "6th": parseTickets(drawFormData.sixth_tickets),
        "7th": parseTickets(drawFormData.seventh_tickets),
        "8th": parseTickets(drawFormData.eighth_tickets),
        amounts: {
          "1st": drawFormData.first_amount,
          consolation: drawFormData.consolation_amount,
          "2nd": drawFormData.second_amount,
          "3rd": drawFormData.third_amount,
          "4th": drawFormData.fourth_amount,
          "5th": drawFormData.fifth_amount,
          "6th": drawFormData.sixth_amount,
          "7th": drawFormData.seventh_amount,
          "8th": drawFormData.eighth_amount,
        },
      },
    };

    try {
      const res = await fetch("/api/admin/draw-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSyncStatus({ type: "success", message: "Draw result saved successfully!" });
        setDrawModalOpen(false);
        await loadDraws();
      } else {
        setSyncStatus({ type: "error", message: json.error || "Failed to save draw result." });
      }
    } catch (e: any) {
      setSyncStatus({ type: "error", message: e.message || "Save error" });
    }
  };

  const handleDeleteDraw = async (id?: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this draw result?")) return;

    try {
      const res = await fetch(`/api/admin/draw-results?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSyncStatus({ type: "success", message: "Draw result deleted successfully." });
        await loadDraws();
      }
    } catch {
      // ignore
    }
  };

  // -------------------------------------------------------------
  // Postponed Draw Handlers
  // -------------------------------------------------------------
  const openNewPostponeModal = () => {
    setPostponeFormData({
      id: undefined,
      draw_date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
      lottery_code: "ALL",
      status: "postponed",
      reason: "",
      rescheduled_date: "",
      disable_cron: true,
    });
    setPostponeModalOpen(true);
  };

  const handleSavePostpone = async () => {
    if (!postponeFormData.reason.trim()) {
      alert("Please provide a reason for postponement / no draw.");
      return;
    }

    try {
      const res = await fetch("/api/admin/postponed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postponeFormData),
      });
      const json = await res.json();
      if (json.success) {
        setSyncStatus({
          type: "success",
          message: `Postponement date ${postponeFormData.draw_date} saved! Cron execution will be skipped on this date.`,
        });
        setPostponeModalOpen(false);
        await loadPostponed();
        await loadCronConfigAndLogs();
      } else {
        setSyncStatus({ type: "error", message: json.error || "Failed to save postponement." });
      }
    } catch (e: any) {
      setSyncStatus({ type: "error", message: e.message || "Save error" });
    }
  };

  const handleDeletePostpone = async (id?: number) => {
    if (!id) return;
    if (!confirm("Remove this postponement entry? Cron will be active for this date again.")) return;

    try {
      const res = await fetch(`/api/admin/postponed?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSyncStatus({ type: "success", message: "Postponement entry removed." });
        await loadPostponed();
        await loadCronConfigAndLogs();
      }
    } catch {
      // ignore
    }
  };

  // -------------------------------------------------------------
  // Bumper Lotteries Handlers
  // -------------------------------------------------------------
  const openNewLotteryModal = (isBumper = true) => {
    setLotteryFormData({
      id: undefined,
      name: "",
      name_ml: "",
      code: "",
      day: isBumper ? "Bumper" : "Monday",
      draw_time: isBumper ? "2:00 PM" : "3:00 PM",
      is_bumper: isBumper,
      jackpot: isBumper ? "₹10 Crore" : "₹1 Crore",
      ticket_price: isBumper ? "₹300" : "₹50",
      draw_date: "",
      draw_season: isBumper ? "Special Draw" : "",
    });
    setLotteryModalOpen(true);
  };

  const openEditLotteryModal = (lot: LotteryRecord) => {
    setLotteryFormData({
      id: lot.id,
      name: lot.name,
      name_ml: lot.name_ml || lot.name,
      code: lot.code,
      day: lot.day,
      draw_time: lot.draw_time || "2:00 PM",
      is_bumper: !!lot.is_bumper,
      jackpot: lot.jackpot || "₹10 Crore",
      ticket_price: lot.ticket_price || "₹300",
      draw_date: lot.draw_date || "",
      draw_season: lot.draw_season || "",
    });
    setLotteryModalOpen(true);
  };

  const handleSaveLottery = async () => {
    if (!lotteryFormData.name || !lotteryFormData.code) {
      alert("Name and Code are required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/lotteries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lotteryFormData),
      });
      const json = await res.json();
      if (json.success) {
        setSyncStatus({ type: "success", message: `Lottery ${lotteryFormData.name} saved!` });
        setLotteryModalOpen(false);
        await loadLotteries();
      } else {
        setSyncStatus({ type: "error", message: json.error || "Failed to save lottery." });
      }
    } catch (e: any) {
      setSyncStatus({ type: "error", message: e.message || "Save error" });
    }
  };

  const handleDeleteLottery = async (id?: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this lottery definition?")) return;

    try {
      const res = await fetch(`/api/admin/lotteries?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSyncStatus({ type: "success", message: "Lottery deleted successfully." });
        await loadLotteries();
      }
    } catch {
      // ignore
    }
  };

  // -------------------------------------------------------------
  // Cron & Settings Handlers
  // -------------------------------------------------------------
  const handleToggleMasterCron = async (enabled: boolean) => {
    setCronConfig((prev) => ({ ...prev, cron_enabled: enabled }));
    try {
      const res = await fetch("/api/admin/cron-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_config", cron_enabled: enabled }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncStatus({
          type: "success",
          message: `Master Cron is now ${enabled ? "ACTIVE (Enabled)" : "PAUSED (Disabled)"}.`,
        });
      }
    } catch {
      // ignore
    }
  };

  const handleSaveCronSettings = async () => {
    setIsSavingCronConfig(true);
    try {
      const res = await fetch("/api/admin/cron-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_config", ...cronConfig }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncStatus({ type: "success", message: "Cron configuration saved successfully in Supabase!" });
      } else {
        setSyncStatus({ type: "error", message: json.error || "Failed to save cron configuration." });
      }
    } catch (e: any) {
      setSyncStatus({ type: "error", message: e.message || "Save error" });
    } finally {
      setIsSavingCronConfig(false);
    }
  };

  const handleTestCronRun = async (force: boolean = false) => {
    setIsTestingCron(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/admin/cron-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_run", force }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.skipped) {
          setSyncStatus({
            type: "warning",
            message: `Cron Test Skipped: ${json.message} (${json.duration_ms}ms)`,
          });
        } else {
          setSyncStatus({
            type: "success",
            message: `Cron Test Passed: ${json.message} in ${json.duration_ms}ms`,
          });
        }
        await loadDraws();
        await loadCronConfigAndLogs();
      } else {
        setSyncStatus({
          type: "error",
          message: `Cron Test Failed: ${json.error || "Unknown error"} (${json.duration_ms}ms)`,
        });
        await loadCronConfigAndLogs();
      }
    } catch (e: any) {
      setSyncStatus({ type: "error", message: `Test run error: ${e.message}` });
    } finally {
      setIsTestingCron(false);
    }
  };

  // Filtered draws
  const filteredDraws = draws.filter((d) => {
    const q = searchDrawTerm.toLowerCase();
    return (
      d.draw_name.toLowerCase().includes(q) ||
      d.draw_code.toLowerCase().includes(q) ||
      d.draw_date.toLowerCase().includes(q) ||
      (d.first?.ticket && d.first.ticket.toLowerCase().includes(q))
    );
  });

  const bumperLotteries = lotteriesList.filter((l) => l.is_bumper || l.day.toLowerCase().includes("bumper"));

  // Check today's postponement status
  const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const todayPostponed = postponedList.find((p) => p.draw_date === todayIST);

  return (
    <Container maxWidth={false} sx={{ py: 5, px: { xs: 2, sm: 3, md: 4, lg: 6 }, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      {/* Top Banner Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 4 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
              Admin Control Center
            </Typography>
            <Chip
              label={cronConfig.cron_enabled ? "Cron ACTIVE" : "Cron PAUSED"}
              color={cronConfig.cron_enabled ? "success" : "warning"}
              size="small"
              sx={{ fontWeight: 800, borderRadius: "6px" }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Spot postponed dates, manage bumper lotteries, edit draw results, and configure automated cron schedules.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            onClick={() => {
              loadDraws();
              loadPostponed();
              loadLotteries();
              loadCronConfigAndLogs();
            }}
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{ fontWeight: 700, borderRadius: "8px", textTransform: "none", bgcolor: "#FFFFFF" }}
          >
            Refresh
          </Button>

          <Button
            onClick={handleManualSync}
            disabled={isSyncing}
            variant="contained"
            startIcon={isSyncing ? <CircularProgress size={18} color="inherit" /> : <CloudDownloadIcon />}
            sx={{
              bgcolor: "#0B3C5D",
              color: "#FFFFFF",
              fontWeight: 800,
              px: 2.5,
              borderRadius: "8px",
              textTransform: "none",
              "&:hover": { bgcolor: "#0F2C59" },
            }}
          >
            {isSyncing ? "Syncing..." : "Sync Latest API Draw"}
          </Button>
        </Box>
      </Box>

      {/* Global Alert Notification */}
      {syncStatus && (
        <Alert severity={syncStatus.type} sx={{ mb: 3, borderRadius: "12px", fontWeight: 600 }} onClose={() => setSyncStatus(null)}>
          {syncStatus.message}
        </Alert>
      )}

      {/* Today's Postponement Warning Banner (if active) */}
      {todayPostponed && (
        <Alert
          severity="warning"
          icon={<WarningAmberIcon fontSize="inherit" />}
          sx={{
            mb: 3,
            borderRadius: "12px",
            border: "1px solid #F59E0B",
            bgcolor: "#FEF3C7",
            color: "#92400E",
            fontWeight: 600,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            ⚠️ TODAY ({todayIST}) IS MARKED AS {todayPostponed.status.toUpperCase()}!
          </Typography>
          <Typography variant="body2">
            Reason: <strong>{todayPostponed.reason}</strong>
            {todayPostponed.rescheduled_date && ` • Rescheduled to: ${todayPostponed.rescheduled_date}`}
            {todayPostponed.disable_cron && " • 🛑 Automatic cron execution is DISABLED for today."}
          </Typography>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E2E8F0", mb: 4, bgcolor: "#FFFFFF", overflow: "hidden" }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: "1px solid #E2E8F0",
            "& .MuiTab-root": {
              fontWeight: 700,
              fontSize: "0.95rem",
              textTransform: "none",
              minHeight: 56,
            },
          }}
        >
          <Tab icon={<TableChartIcon />} iconPosition="start" label={`Draw Results Archive (${draws.length})`} />
          <Tab icon={<EventBusyIcon />} iconPosition="start" label={`Postponed & No-Draw Spotter (${postponedList.length})`} />
          <Tab icon={<EmojiEventsIcon />} iconPosition="start" label={`Bumper Lotteries Hub (${bumperLotteries.length})`} />
          <Tab icon={<SettingsIcon />} iconPosition="start" label="Cron & Automation Settings" />
          <Tab icon={<CampaignIcon />} iconPosition="start" label="📢 1st Prize Broadcast" />
        </Tabs>
      </Paper>

      {/* ========================================================================= */}
      {/* TAB 0: DRAW RESULTS ARCHIVE & MANUAL ENTRY                               */}
      {/* ========================================================================= */}
      {currentTab === 0 && (
        <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", overflow: "hidden" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #E2E8F0", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#1E293B" }}>
                Stored Draw Results Archive
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                View, manually enter, update, or remove weekly and bumper lottery results.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <TextField
                size="small"
                placeholder="Search date, code, ticket..."
                value={searchDrawTerm}
                onChange={(e) => setSearchDrawTerm(e.target.value)}
                sx={{ width: 220, bgcolor: "#F8FAFC" }}
              />
              <Button
                onClick={() => setAiPdfModalOpen(true)}
                variant="contained"
                startIcon={<AutoAwesomeIcon sx={{ color: "#FFD700" }} />}
                sx={{
                  background: "linear-gradient(135deg, #0B3C5D 0%, #1D2731 100%)",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(11, 60, 93, 0.2)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #07263b 0%, #0F172A 100%)",
                  },
                }}
              >
                ✨ AI Upload Gazette PDF
              </Button>
              <Button
                onClick={openNewDrawModal}
                variant="contained"
                startIcon={<AddCircleIcon />}
                sx={{ bgcolor: "#2E7D32", color: "#FFFFFF", fontWeight: 700, textTransform: "none", borderRadius: "8px", "&:hover": { bgcolor: "#1B5E20" } }}
              >
                + Enter Draw Result
              </Button>
            </Box>
          </Box>

          {isLoadingDraws ? (
            <Box sx={{ p: 3 }}>
              <TableSkeleton rows={6} />
            </Box>
          ) : filteredDraws.length > 0 ? (
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table>
                <TableHead sx={{ bgcolor: "#F1F5F9" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Draw Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Lottery Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Draw Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>1st Prize Ticket</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Location / Agent</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDraws.map((row) => (
                    <TableRow key={row.id || `${row.draw_date}-${row.draw_code}`} hover>
                      <TableCell sx={{ fontWeight: 700, color: "#1E293B" }}>{row.draw_date}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#0B3C5D" }}>{row.draw_name}</TableCell>
                      <TableCell>
                        <Chip label={row.draw_code} size="small" sx={{ fontWeight: 700, bgcolor: "#E0F2FE", color: "#0369A1", borderRadius: "6px" }} />
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 800, color: "#D97706", fontSize: "1rem" }}>
                        {row.first?.ticket || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: "#475569", fontSize: "0.85rem" }}>
                        {row.first?.location || "N/A"} {row.first?.agent ? `• ${row.first.agent}` : ""}
                      </TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        <Tooltip title="Edit Draw Result">
                          <IconButton size="small" onClick={() => openEditDrawModal(row)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Draw Result">
                          <IconButton size="small" onClick={() => handleDeleteDraw(row.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="body1" sx={{ color: "#64748B" }}>
                No draw results found matching your query.
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: POSTPONED & NO-DRAW SPOTTER                                       */}
      {/* ========================================================================= */}
      {currentTab === 1 && (
        <Box>
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1E293B" }}>
                  Spot / Declare Postponed & No-Draw Days
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  When marked as postponed or cancelled, <strong>NO automatic cron will run on that day</strong>, and visitors will see a clear postponement notice.
                </Typography>
              </Box>
              <Button
                onClick={openNewPostponeModal}
                variant="contained"
                startIcon={<AddCircleIcon />}
                sx={{ bgcolor: "#D97706", color: "#FFFFFF", fontWeight: 700, textTransform: "none", borderRadius: "8px", "&:hover": { bgcolor: "#B45309" } }}
              >
                + Spot Postponed Date
              </Button>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", overflow: "hidden" }}>
            <Box sx={{ p: 3, borderBottom: "1px solid #E2E8F0", bgcolor: "#F8FAFC" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1E293B" }}>
                Active & Past Postponed Dates List ({postponedList.length})
              </Typography>
            </Box>

            {isLoadingPostponed ? (
              <Box sx={{ p: 3 }}>
                <TableSkeleton rows={4} />
              </Box>
            ) : postponedList.length > 0 ? (
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#F1F5F9" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Postponed Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Lottery</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Reason / Holiday Notice</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rescheduled Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Cron Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {postponedList.map((item) => (
                      <TableRow key={item.id || item.draw_date} hover>
                        <TableCell sx={{ fontWeight: 800, color: "#DC2626" }}>{item.draw_date}</TableCell>
                        <TableCell>
                          <Chip label={item.lottery_code || "ALL"} size="small" sx={{ fontWeight: 700, borderRadius: "6px" }} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.status.toUpperCase()}
                            size="small"
                            color={item.status === "postponed" ? "warning" : item.status === "holiday" ? "info" : "error"}
                            sx={{ fontWeight: 800, borderRadius: "6px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#334155" }}>{item.reason}</TableCell>
                        <TableCell sx={{ color: "#0B3C5D", fontWeight: 700 }}>{item.rescheduled_date || "—"}</TableCell>
                        <TableCell>
                          {item.disable_cron ? (
                            <Chip label="🛑 Cron Blocked" size="small" sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontWeight: 700 }} />
                          ) : (
                            <Chip label="Cron Allowed" size="small" sx={{ bgcolor: "#E0F2FE", color: "#0369A1", fontWeight: 700 }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: "right" }}>
                          <Tooltip title="Delete Postponement Entry">
                            <IconButton size="small" onClick={() => handleDeletePostpone(item.id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <Typography variant="body1" sx={{ color: "#64748B" }}>
                  No postponed dates registered. All scheduled weekly and bumper lotteries will execute crons normally.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUMPER LOTTERIES HUB                                              */}
      {/* ========================================================================= */}
      {currentTab === 2 && (
        <Box>
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1E293B" }}>
                  Kerala Bumper Lotteries Management
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  Add, update, or publish Kerala Bumper lotteries (Thiruvonam, Christmas New Year, Vishu, Pooja, Monsoon, Summer).
                </Typography>
              </Box>
              <Button
                onClick={() => openNewLotteryModal(true)}
                variant="contained"
                startIcon={<AddCircleIcon />}
                sx={{ bgcolor: "#0B3C5D", color: "#FFFFFF", fontWeight: 700, textTransform: "none", borderRadius: "8px", "&:hover": { bgcolor: "#0F2C59" } }}
              >
                + Add Bumper Lottery
              </Button>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            {isLoadingLotteries ? (
              <Grid size={{ xs: 12 }}>
                <TableSkeleton rows={4} />
              </Grid>
            ) : bumperLotteries.length > 0 ? (
              bumperLotteries.map((bumper) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={bumper.id || bumper.code}>
                  <Card sx={{ borderRadius: "16px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                        <Chip label={bumper.code} size="small" sx={{ fontWeight: 800, bgcolor: "#FEF3C7", color: "#B45309" }} />
                        <Box>
                          <IconButton size="small" onClick={() => openEditLotteryModal(bumper)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {bumper.id && (
                            <IconButton size="small" onClick={() => handleDeleteLottery(bumper.id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 0.5 }}>
                        {bumper.name}
                      </Typography>
                      {bumper.name_ml && (
                        <Typography variant="body2" sx={{ color: "#64748B", mb: 2, fontWeight: 600 }}>
                          {bumper.name_ml}
                        </Typography>
                      )}

                      <Divider sx={{ my: 1.5 }} />

                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" sx={{ color: "#64748B" }}>
                          First Prize Jackpot:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "#D97706" }}>
                          {bumper.jackpot || "₹10 Crore"}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" sx={{ color: "#64748B" }}>
                          Ticket Price:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#1E293B" }}>
                          {bumper.ticket_price || "₹300"}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        <Typography variant="body2" sx={{ color: "#64748B" }}>
                          Draw Date / Season:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0B3C5D" }}>
                          {bumper.draw_date || bumper.draw_season || bumper.day}
                        </Typography>
                      </Box>

                      <Button
                        fullWidth
                        onClick={() => {
                          openNewDrawModal();
                          setDrawFormData((prev) => ({
                            ...prev,
                            draw_name: bumper.name,
                            lottery_code: bumper.code,
                            draw_code: `${bumper.code}-${new Date().getFullYear()}`,
                            first_amount: bumper.jackpot || "10,00,00,000/-",
                          }));
                        }}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
                      >
                        Enter Bumper Result
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 5, textAlign: "center", borderRadius: "16px" }}>
                  <Typography variant="body1" sx={{ color: "#64748B" }}>
                    No Bumper lotteries registered yet. Click &quot;Add Bumper Lottery&quot; to create one.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CRON & AUTOMATION SETTINGS                                        */}
      {/* ========================================================================= */}
      {currentTab === 3 && (
        <Box>
          <Grid container spacing={3}>
            {/* Left Column: Cron Master Control & Config */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1E293B", mb: 2 }}>
                  Master Automation Control
                </Typography>

                {/* Master Switch */}
                <Box sx={{ p: 2.5, bgcolor: cronConfig.cron_enabled ? "#F0FDF4" : "#FEF2F2", borderRadius: "12px", border: `1px solid ${cronConfig.cron_enabled ? "#BBF7D0" : "#FECACA"}`, mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cronConfig.cron_enabled}
                        onChange={(e) => handleToggleMasterCron(e.target.checked)}
                        color="success"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: cronConfig.cron_enabled ? "#166534" : "#991B1B" }}>
                          {cronConfig.cron_enabled ? "Cron System is ENABLED" : "Cron System is PAUSED"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          {cronConfig.cron_enabled
                            ? "Automated syncing executes according to schedule (except on postponed days)."
                            : "All automated sync executions are skipped until re-enabled."}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                  <Button
                    fullWidth
                    disabled={isTestingCron}
                    onClick={() => handleTestCronRun(false)}
                    variant="contained"
                    startIcon={isTestingCron ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                    sx={{
                      bgcolor: "#D97706",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      py: 1.2,
                      borderRadius: "8px",
                      textTransform: "none",
                      "&:hover": { bgcolor: "#B45309" },
                    }}
                  >
                    {isTestingCron ? "Running Test Verification..." : "Run Immediate Cron Sync Test"}
                  </Button>

                  {todayPostponed && (
                    <Button
                      fullWidth
                      disabled={isTestingCron}
                      onClick={() => handleTestCronRun(true)}
                      variant="outlined"
                      sx={{
                        borderColor: "#D97706",
                        color: "#B45309",
                        fontWeight: 700,
                        py: 0.8,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "0.82rem",
                        "&:hover": { bgcolor: "#FEF3C7" },
                      }}
                    >
                      ⚡ Force Sync (Bypass Today's Cancellation)
                    </Button>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1E293B", mb: 1.5 }}>
                  Multi-Phase Split Schedule Controls
                </Typography>

                {/* 1. WEEKLY MULTI-PHASE SCHEDULE */}
                <Box sx={{ p: 2, mb: 2.5, borderRadius: "12px", bgcolor: "#F0F9FF", border: "1px solid #BAE6FD" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0369A1" }}>
                      📅 Regular Weekly Draw (Split Phases)
                    </Typography>
                    <Chip label="2-Hour Window" size="small" sx={{ bgcolor: "#E0F2FE", color: "#0369A1", fontWeight: 800, fontSize: "0.7rem" }} />
                  </Box>

                  <Grid container spacing={1.5}>
                    {/* Phase 1 Live Draw */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#0B3C5D", display: "block", mb: 0.5 }}>
                        ⚡ Phase 1: Live Draw Fast Polling
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="P1 Start (IST)"
                        value={cronConfig.cron_start_time}
                        onChange={(e) => setCronConfig((prev) => ({ ...prev, cron_start_time: e.target.value }))}
                        helperText="e.g. 15:00"
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="P1 End (IST)"
                        value={cronConfig.cron_phase1_end_time || "16:00"}
                        onChange={(e) => setCronConfig((prev) => ({ ...prev, cron_phase1_end_time: e.target.value }))}
                        helperText="e.g. 16:00"
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="P1 Frequency"
                        value={cronConfig.cron_frequency_mins}
                        onChange={(e) => setCronConfig((prev) => ({ ...prev, cron_frequency_mins: e.target.value }))}
                        helperText="Minutes (e.g. 1)"
                      />
                    </Grid>

                    {/* Phase 2 Verification */}
                    <Grid size={{ xs: 12 }} sx={{ mt: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#0B3C5D", display: "block", mb: 0.5 }}>
                        🔍 Phase 2: Post-Draw Verification & Full Book
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="P2 End Time (IST)"
                        value={cronConfig.cron_end_time}
                        onChange={(e) => setCronConfig((prev) => ({ ...prev, cron_end_time: e.target.value }))}
                        helperText="e.g. 17:00 (5:00 PM)"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="P2 Frequency"
                        value={cronConfig.cron_phase2_frequency_mins || "5"}
                        onChange={(e) => setCronConfig((prev) => ({ ...prev, cron_phase2_frequency_mins: e.target.value }))}
                        helperText="Minutes (e.g. 5)"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* 2. BUMPER MULTI-PHASE SCHEDULE */}
                <Box sx={{ p: 2, mb: 2.5, borderRadius: "12px", bgcolor: "#FAF5FF", border: "1px solid #E9D5FF" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#7E22CE" }}>
                      👑 Kerala Bumper Draw (Split Phases)
                    </Typography>
                    <Chip label="4-Hour Window" size="small" sx={{ bgcolor: "#F3E8FF", color: "#7E22CE", fontWeight: 800, fontSize: "0.7rem" }} />
                  </Box>

                  <Grid container spacing={1.5}>
                    {/* Bumper Phase 1 */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#6B21A8", display: "block", mb: 0.5 }}>
                        ⚡ Bumper Phase 1: Live Mega Draw
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="P1 Start (IST)"
                        value={cronConfig.cron_bumper_start_time}
                        onChange={(e) => setCronConfig((prev) => ({ ...prev, cron_bumper_start_time: e.target.value }))}
                        helperText="e.g. 14:00"
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="P1 End (IST)"
                        value={cronConfig.cron_bumper_phase1_end_time || "16:00"}
                        onChange={(e) => setCronConfig((prev) => ({ ...prev, cron_bumper_phase1_end_time: e.target.value }))}
                        helperText="e.g. 16:00"
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="P1 Frequency"
                        value={cronConfig.cron_bumper_frequency_mins || "1"}
                        onChange={(e) => setCronConfig((prev) => ({ ...prev, cron_bumper_frequency_mins: e.target.value }))}
                        helperText="Minutes (e.g. 1)"
                      />
                    </Grid>

                    {/* Bumper Phase 2 */}
                    <Grid size={{ xs: 12 }} sx={{ mt: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#6B21A8", display: "block", mb: 0.5 }}>
                        🏆 Bumper Phase 2: Complete Prize Book & PDF
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="P2 End Time (IST)"
                        value={cronConfig.cron_bumper_end_time}
                        onChange={(e) => setCronConfig((prev) => ({ ...prev, cron_bumper_end_time: e.target.value }))}
                        helperText="e.g. 18:00 (6:00 PM)"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="P2 Frequency"
                        value={cronConfig.cron_bumper_phase2_frequency_mins || "5"}
                        onChange={(e) => setCronConfig((prev) => ({ ...prev, cron_bumper_phase2_frequency_mins: e.target.value }))}
                        helperText="Minutes (e.g. 5)"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* 3. APP URL & CRON SECRET */}
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="App Website URL"
                      value={cronConfig.app_url || ""}
                      onChange={(e) => setCronConfig((prev) => ({ ...prev, app_url: e.target.value }))}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="CRON_SECRET Key"
                      type="password"
                      value={cronConfig.cron_secret || ""}
                      onChange={(e) => setCronConfig((prev) => ({ ...prev, cron_secret: e.target.value }))}
                    />
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  onClick={handleSaveCronSettings}
                  disabled={isSavingCronConfig}
                  variant="contained"
                  sx={{ mt: 3, bgcolor: "#0B3C5D", color: "#FFFFFF", fontWeight: 800, borderRadius: "8px", textTransform: "none" }}
                >
                  {isSavingCronConfig ? "Saving..." : "Save Split Multi-Phase Settings to Database"}
                </Button>
              </Paper>
            </Grid>

            {/* Right Column: Cron Execution History Logs */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#1E293B" }}>
                    Cron Execution & Skip Logs ({cronLogs.length})
                  </Typography>
                  <Button size="small" onClick={loadCronConfigAndLogs} startIcon={<RefreshIcon />} sx={{ textTransform: "none", fontWeight: 700 }}>
                    Reload Logs
                  </Button>
                </Box>

                {isLoadingCron ? (
                  <TableSkeleton rows={5} />
                ) : cronLogs.length > 0 ? (
                  <TableContainer sx={{ maxHeight: 400, overflowY: "auto" }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#F1F5F9" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Time (UTC/IST)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Trigger</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Message</TableCell>
                          <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Duration</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cronLogs.map((log, idx) => (
                          <TableRow key={log.id || idx} hover>
                            <TableCell sx={{ fontSize: "0.8rem", color: "#64748B" }}>
                              {log.execution_time ? new Date(log.execution_time).toLocaleTimeString() : "—"}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={log.status.toUpperCase()}
                                size="small"
                                color={log.status === "success" ? "success" : log.status === "skipped" ? "warning" : "error"}
                                sx={{ fontWeight: 800, fontSize: "0.7rem", borderRadius: "4px" }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155" }}>
                              {log.trigger_source}
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.8rem", color: "#1E293B", maxWidth: 260 }}>
                              {log.message}
                            </TableCell>
                            <TableCell sx={{ textAlign: "right", fontSize: "0.8rem", color: "#64748B" }}>
                              {log.duration_ms ? `${log.duration_ms}ms` : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body2" sx={{ color: "#64748B" }}>
                      No cron execution logs recorded yet. Run a test sync to verify logging.
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Supabase pg_cron Quick Setup Snippet */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1E293B" }}>
                    Supabase pg_cron Continuous Schedule SQL
                  </Typography>
                  <Button
                    size="small"
                    startIcon={copiedSql ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                    onClick={() => {
                      navigator.clipboard.writeText("SELECT cron.schedule('lottery_sync_master_daily', '* 8-13 * * *', $$SELECT public.trigger_lottery_sync();$$);");
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    {copiedSql ? "Copied!" : "Copy Schedule SQL"}
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ color: "#64748B", mb: 1 }}>
                  Runs automatically every 1 minute between 1:30 PM and 6:30 PM IST (the interval frequency you set on the left e.g. 1 min, 2 min, 3 min controls actual sync frequency):
                </Typography>
                <Box sx={{ p: 2, bgcolor: "#1E293B", color: "#E2E8F0", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.8rem", wordBreak: "break-all" }}>
                  SELECT cron.schedule(&apos;lottery_sync_master_daily&apos;, &apos;* 8-13 * * *&apos;, $$SELECT public.trigger_lottery_sync();$$);
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 1ST PRIZE BROADCAST TO TELEGRAM & WHATSAPP                         */}
      {/* ========================================================================= */}
      {currentTab === 4 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Header Banner */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1E293B", display: "flex", alignItems: "center", gap: 1 }}>
                  📢 1st Prize Instant Broadcast to Telegram & WhatsApp
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
                  Automatically triggers an instant alert containing ONLY the 1st Prize Winning Number and direct link to website / mobile app when results are published.
                </Typography>
              </Box>

              <Button
                startIcon={<RefreshIcon />}
                onClick={loadBroadcastStatus}
                disabled={isLoadingBroadcast}
                variant="outlined"
                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
              >
                {isLoadingBroadcast ? "Refreshing..." : "Refresh Status"}
              </Button>
            </Box>
          </Paper>

          {/* Service Status Cards Grid */}
          <Grid container spacing={3}>
            {/* Telegram Channel / Group Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "#0088CC", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TelegramIcon fontSize="medium" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1E293B" }}>
                          Telegram Channel / Group
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                          Official Bot API Broadcast
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={broadcastStatus?.telegram?.configured ? "CONFIGURED (.env)" : "NOT CONFIGURED"}
                      color={broadcastStatus?.telegram?.configured ? "success" : "default"}
                      size="small"
                      sx={{ fontWeight: 800, borderRadius: "6px", fontSize: "0.72rem" }}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                        TELEGRAM_BOT_TOKEN:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: broadcastStatus?.telegram?.bot_token_set ? "#16A34A" : "#DC2626" }}>
                        {broadcastStatus?.telegram?.bot_token_set ? "Set in .env (Hidden)" : "Missing in .env"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                        TELEGRAM_CHAT_ID:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
                        {broadcastStatus?.telegram?.chat_id || "None"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                        Auto-Broadcast Status:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: broadcastStatus?.telegram?.enabled ? "#16A34A" : "#DC2626" }}>
                        {broadcastStatus?.telegram?.enabled ? "ENABLED" : "DISABLED"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={isTestingTg ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                  disabled={isTestingTg || !broadcastStatus?.telegram?.configured}
                  onClick={handleTestTelegram}
                  sx={{
                    bgcolor: "#0088CC",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "10px",
                    py: 1.2,
                    "&:hover": { bgcolor: "#0077B5" },
                  }}
                >
                  {isTestingTg ? "Sending Test..." : "Send Test Alert to Telegram"}
                </Button>
              </Paper>
            </Grid>

            {/* WhatsApp Group / Channel Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "#25D366", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <WhatsAppIcon fontSize="medium" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1E293B" }}>
                          WhatsApp Channel / Group
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                          Cloud API & Webhook Gateway
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={broadcastStatus?.whatsapp?.configured ? "CONFIGURED (.env)" : "NOT CONFIGURED"}
                      color={broadcastStatus?.whatsapp?.configured ? "success" : "default"}
                      size="small"
                      sx={{ fontWeight: 800, borderRadius: "6px", fontSize: "0.72rem" }}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                        Provider Mode:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
                        {broadcastStatus?.whatsapp?.provider === "meta_cloud_api" ? "Meta Cloud API" : broadcastStatus?.whatsapp?.provider === "webhook_gateway" ? "Webhook Gateway" : "None"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                        Recipient (Group/Phone):
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
                        {broadcastStatus?.whatsapp?.recipient || "None"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                        Auto-Broadcast Status:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: broadcastStatus?.whatsapp?.enabled ? "#16A34A" : "#DC2626" }}>
                        {broadcastStatus?.whatsapp?.enabled ? "ENABLED" : "DISABLED"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={isTestingWa ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                  disabled={isTestingWa || !broadcastStatus?.whatsapp?.configured}
                  onClick={handleTestWhatsApp}
                  sx={{
                    bgcolor: "#16A34A",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "10px",
                    py: 1.2,
                    "&:hover": { bgcolor: "#15803D" },
                  }}
                >
                  {isTestingWa ? "Sending Test..." : "Send Test Alert to WhatsApp"}
                </Button>
              </Paper>
            </Grid>

            {/* Manual Broadcast & Last Broadcast Status */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", height: "100%" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1E293B", mb: 1 }}>
                  🚀 Manual 1st Prize Broadcast Trigger
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
                  Select any draw result from your archive to immediately push its 1st Prize announcement to Telegram and WhatsApp.
                </Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 3 }}>
                  <TextField
                    select
                    size="small"
                    label="Select Draw Result"
                    value={selectedBroadcastDrawDate}
                    onChange={(e) => setSelectedBroadcastDrawDate(e.target.value)}
                    sx={{ minWidth: 280, flex: 1 }}
                  >
                    {draws.slice(0, 15).map((d) => (
                      <MenuItem key={`${d.draw_date}_${d.lottery_code}`} value={`${d.draw_date}|${d.lottery_code}`}>
                        {d.draw_date} - {d.draw_name} (1st: {d.first?.ticket || "None"})
                      </MenuItem>
                    ))}
                  </TextField>

                  <Button
                    variant="contained"
                    startIcon={isBroadcastingManual ? <CircularProgress size={16} color="inherit" /> : <CampaignIcon />}
                    disabled={isBroadcastingManual || !selectedBroadcastDrawDate}
                    onClick={() => {
                      const [drawDate, lotteryCode] = selectedBroadcastDrawDate.split("|");
                      handleBroadcastDrawNow(drawDate, lotteryCode);
                    }}
                    sx={{
                      bgcolor: "#0B3C5D",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      textTransform: "none",
                      borderRadius: "8px",
                      px: 3,
                      py: 1,
                      "&:hover": { bgcolor: "#07263b" },
                    }}
                  >
                    {isBroadcastingManual ? "Broadcasting..." : "Broadcast 1st Prize Now"}
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ bgcolor: "#F8FAFC", p: 2, borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#475569", display: "block", mb: 0.5 }}>
                    🔒 SMART DEDUPLICATION & LAST BROADCAST STATE:
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1E293B", fontWeight: 600 }}>
                    Last Broadcast Draw: <strong>{broadcastStatus?.last_broadcast?.draw || "No broadcasts recorded yet"}</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>
                    Timestamp: {broadcastStatus?.last_broadcast?.time ? new Date(broadcastStatus.last_broadcast.time).toLocaleString() : "—"}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Message Preview Box */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", height: "100%" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1E293B", mb: 1 }}>
                  📱 Broadcast Message Layout (Preview)
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", display: "block", mb: 1.5 }}>
                  This exact formatted text with 1st Prize and clickable website / mobile app link is delivered:
                </Typography>

                <Box
                  sx={{
                    bgcolor: "#1E293B",
                    color: "#F8FAFC",
                    p: 2,
                    borderRadius: "12px",
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {`🎉 *KERALA LOTTERY 1st PRIZE RESULT* 🎉
━━━━━━━━━━━━━━━━━━━━━━
🎫 *Lottery:* Sthree Sakthi (SS-450)
📅 *Draw Date:* ${new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })}
💰 *1st Prize Amount:* ₹75,00,000 (₹75 Lakhs)

🏆 *1st PRIZE WINNING NUMBER:*
👉 🔴 *SE 974999* 🔴 👈
━━━━━━━━━━━━━━━━━━━━━━

🔍 *Check 2nd to 8th Prizes & Verify Your Ticket Number:*
👉 https://www.keralalotteryresultstoday.in/sthreesakthi/${new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })}

📲 Open on Web or Mobile App to check complete results and search your ticket series!`}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* MODAL: POSTPONE / NO DRAW SPOTTER FORM                                   */}
      {/* ========================================================================= */}
      <Dialog open={postponeModalOpen} onClose={() => setPostponeModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#1E293B" }}>
          Spot / Declare Postponed or No-Draw Day
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <TextField
              label="Draw Date to Postpone (YYYY-MM-DD)"
              type="date"
              fullWidth
              value={postponeFormData.draw_date}
              onChange={(e) => setPostponeFormData((prev) => ({ ...prev, draw_date: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              select
              label="Applies to Lottery"
              fullWidth
              value={postponeFormData.lottery_code}
              onChange={(e) => setPostponeFormData((prev) => ({ ...prev, lottery_code: e.target.value }))}
            >
              <MenuItem value="ALL">ALL Lotteries on this day</MenuItem>
              {ALL_LOTTERIES.map((l) => (
                <MenuItem key={l.code} value={l.code}>
                  {l.name} ({l.code})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status Type"
              fullWidth
              value={postponeFormData.status}
              onChange={(e) => setPostponeFormData((prev) => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value="postponed">Postponed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="holiday">Public / Government Holiday (No Draw)</MenuItem>
              <MenuItem value="no_draw">No Draw Scheduled</MenuItem>
            </TextField>

            <TextField
              label="Reason / Public Notice (Mandatory)"
              multiline
              rows={2}
              fullWidth
              placeholder="e.g. Independence Day Holiday - No Kerala Lottery Draw Today"
              value={postponeFormData.reason}
              onChange={(e) => setPostponeFormData((prev) => ({ ...prev, reason: e.target.value }))}
              helperText="This reason will be prominently displayed to visitors on the website."
            />

            <TextField
              label="Rescheduled Date (Optional)"
              type="date"
              fullWidth
              value={postponeFormData.rescheduled_date}
              onChange={(e) => setPostponeFormData((prev) => ({ ...prev, rescheduled_date: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="If the draw is postponed to a future date, specify it here."
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={postponeFormData.disable_cron}
                  onChange={(e) => setPostponeFormData((prev) => ({ ...prev, disable_cron: e.target.checked }))}
                  color="error"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#991B1B" }}>
                  Disable / Skip Cron execution automatically on this date
                </Typography>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setPostponeModalOpen(false)} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleSavePostpone} variant="contained" sx={{ bgcolor: "#D97706", fontWeight: 800, "&:hover": { bgcolor: "#B45309" } }}>
            Save Postponed Date
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: BUMPER LOTTERY FORM                                               */}
      {/* ========================================================================= */}
      <Dialog open={lotteryModalOpen} onClose={() => setLotteryModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#1E293B" }}>
          {lotteryFormData.id ? "Edit Bumper Lottery" : "Add New Bumper Lottery"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Lottery Name (English)"
              fullWidth
              placeholder="e.g. Thiruvonam Bumper 2026"
              value={lotteryFormData.name}
              onChange={(e) => setLotteryFormData((prev) => ({ ...prev, name: e.target.value }))}
            />

            <TextField
              label="Lottery Name (Malayalam)"
              fullWidth
              placeholder="e.g. തിരുവോണം ബംപർ"
              value={lotteryFormData.name_ml}
              onChange={(e) => setLotteryFormData((prev) => ({ ...prev, name_ml: e.target.value }))}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Lottery Code"
                  fullWidth
                  placeholder="e.g. TH or BR-105"
                  value={lotteryFormData.code}
                  onChange={(e) => setLotteryFormData((prev) => ({ ...prev, code: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Draw Season / Month"
                  fullWidth
                  placeholder="e.g. September (Onam)"
                  value={lotteryFormData.draw_season}
                  onChange={(e) => setLotteryFormData((prev) => ({ ...prev, draw_season: e.target.value }))}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="1st Prize Jackpot"
                  fullWidth
                  placeholder="e.g. ₹25 Crore"
                  value={lotteryFormData.jackpot}
                  onChange={(e) => setLotteryFormData((prev) => ({ ...prev, jackpot: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Ticket Price"
                  fullWidth
                  placeholder="e.g. ₹500"
                  value={lotteryFormData.ticket_price}
                  onChange={(e) => setLotteryFormData((prev) => ({ ...prev, ticket_price: e.target.value }))}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Draw Date (Optional)"
                  type="date"
                  fullWidth
                  value={lotteryFormData.draw_date}
                  onChange={(e) => setLotteryFormData((prev) => ({ ...prev, draw_date: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Draw Time"
                  fullWidth
                  value={lotteryFormData.draw_time}
                  onChange={(e) => setLotteryFormData((prev) => ({ ...prev, draw_time: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setLotteryModalOpen(false)} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleSaveLottery} variant="contained" sx={{ bgcolor: "#0B3C5D", fontWeight: 800 }}>
            Save Bumper Lottery
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: MANUAL DRAW RESULT ENTRY & EDIT                                    */}
      {/* ========================================================================= */}
      <Dialog open={drawModalOpen} onClose={() => setDrawModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#1E293B" }}>
          {editingDraw ? `Edit Draw Result: ${editingDraw.draw_name} (${editingDraw.draw_code})` : "Enter Manual Lottery Draw Result"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Draw Date (YYYY-MM-DD)"
                  type="date"
                  fullWidth
                  value={drawFormData.draw_date}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, draw_date: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label="Lottery Name"
                  fullWidth
                  value={drawFormData.lottery_code}
                  onChange={(e) => {
                    const selected = ALL_LOTTERIES.find((l) => l.code === e.target.value);
                    setDrawFormData((prev) => ({
                      ...prev,
                      lottery_code: e.target.value,
                      draw_name: selected ? selected.name : prev.draw_name,
                      first_amount: (selected && "jackpot" in selected) ? (selected as any).jackpot : "1,00,00,000/-",
                    }));
                  }}
                >
                  {ALL_LOTTERIES.map((l) => (
                    <MenuItem key={l.code} value={l.code}>
                      {l.name} ({l.code}) {l.is_bumper ? "★ Bumper" : ""}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Draw Code (e.g. BT-120, TH-10)"
                  fullWidth
                  value={drawFormData.draw_code}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, draw_code: e.target.value }))}
                />
              </Grid>
            </Grid>

            <Divider>
              <Chip label="1st Prize Winner & Details" size="small" sx={{ fontWeight: 800, bgcolor: "#FEF3C7", color: "#B45309" }} />
            </Divider>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="1st Prize Ticket Number (e.g. WA 123456)"
                  fullWidth
                  required
                  value={drawFormData.first_ticket}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, first_ticket: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Location (e.g. Palakkad, Kollam)"
                  fullWidth
                  value={drawFormData.first_location}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, first_location: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Agent / Agency"
                  fullWidth
                  value={drawFormData.first_agent}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, first_agent: e.target.value }))}
                />
              </Grid>
            </Grid>

            <Divider>
              <Chip label="Other Prize Tiers (Comma or space separated)" size="small" sx={{ fontWeight: 700 }} />
            </Divider>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Consolation Prize Tickets"
                  multiline
                  rows={2}
                  fullWidth
                  placeholder="e.g. WB 123456, WC 123456, WD 123456"
                  value={drawFormData.consolation_tickets}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, consolation_tickets: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="2nd Prize Tickets"
                  multiline
                  rows={2}
                  fullWidth
                  placeholder="e.g. WN 654321, WP 987654"
                  value={drawFormData.second_tickets}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, second_tickets: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="3rd Prize Tickets"
                  multiline
                  rows={2}
                  fullWidth
                  placeholder="e.g. 1234, 5678, 9012"
                  value={drawFormData.third_tickets}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, third_tickets: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="4th Prize Tickets"
                  multiline
                  rows={2}
                  fullWidth
                  placeholder="e.g. 1122, 3344, 5566"
                  value={drawFormData.fourth_tickets}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, fourth_tickets: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="5th Prize Tickets"
                  multiline
                  rows={2}
                  fullWidth
                  value={drawFormData.fifth_tickets}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, fifth_tickets: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="6th Prize Tickets"
                  multiline
                  rows={2}
                  fullWidth
                  value={drawFormData.sixth_tickets}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, sixth_tickets: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="7th Prize Tickets"
                  multiline
                  rows={2}
                  fullWidth
                  value={drawFormData.seventh_tickets}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, seventh_tickets: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="8th Prize Tickets"
                  multiline
                  rows={2}
                  fullWidth
                  value={drawFormData.eighth_tickets}
                  onChange={(e) => setDrawFormData((prev) => ({ ...prev, eighth_tickets: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDrawModalOpen(false)} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleSaveDrawResult} variant="contained" sx={{ bgcolor: "#2E7D32", fontWeight: 800, "&:hover": { bgcolor: "#1B5E20" } }}>
            Save Draw Result
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gemini AI Gazette PDF / Image Ingestion Modal */}
      <AiGazettePdfUploader
        open={aiPdfModalOpen}
        onClose={() => setAiPdfModalOpen(false)}
        onResultExtracted={handleAiPdfResultExtracted}
      />
    </Container>
  );
}
