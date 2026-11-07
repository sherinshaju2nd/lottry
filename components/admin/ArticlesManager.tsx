"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Autocomplete from "@mui/material/Autocomplete";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import StarIcon from "@mui/icons-material/Star";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";
import TitleIcon from "@mui/icons-material/Title";
import TableChartIcon from "@mui/icons-material/TableChart";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

import ArticleContent from "@/components/articles/ArticleContent";
import {
  ARTICLE_CATEGORIES,
  Article,
  ArticleCategory,
  ArticleFaq,
  countWords,
  estimateReadingMinutes,
  formatArticleDate,
  getArticlePath,
  getCategoryMeta,
  markdownToPlainText,
  slugify,
} from "@/lib/articles";
import {
  SEO_LIMITS,
  effectiveMetaDescription,
  effectiveMetaTitle,
  evaluateSeo,
} from "@/lib/articleSeo";

// ---------------------------------------------------------------------------------------------
// Form model
// ---------------------------------------------------------------------------------------------

interface ArticleForm {
  id?: string;
  title: string;
  slug: string;
  slugTouched: boolean;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  tags: string[];
  author_name: string;
  status: "draft" | "published";
  publish_at_local: string; // yyyy-MM-ddTHH:mm in the admin's local time
  is_featured: boolean;
  cover_image_url: string;
  cover_image_alt: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  canonical_url: string;
  og_image_url: string;
  noindex: boolean;
  faqs: ArticleFaq[];
}

const toLocalInput = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const EMPTY_FORM: ArticleForm = {
  title: "",
  slug: "",
  slugTouched: false,
  excerpt: "",
  content: "",
  category: "news",
  tags: [],
  author_name: "Kerala Lottery Results Today Desk",
  status: "draft",
  publish_at_local: "",
  is_featured: false,
  cover_image_url: "",
  cover_image_alt: "",
  meta_title: "",
  meta_description: "",
  focus_keyword: "",
  canonical_url: "",
  og_image_url: "",
  noindex: false,
  faqs: [],
};

const articleToForm = (a: Article): ArticleForm => ({
  id: a.id,
  title: a.title,
  slug: a.slug,
  slugTouched: true,
  excerpt: a.excerpt ?? "",
  content: a.content ?? "",
  category: a.category,
  tags: a.tags ?? [],
  author_name: a.author_name ?? "Kerala Lottery Result Today Desk",
  status: a.status,
  publish_at_local: toLocalInput(a.published_at),
  is_featured: a.is_featured,
  cover_image_url: a.cover_image_url ?? "",
  cover_image_alt: a.cover_image_alt ?? "",
  meta_title: a.meta_title ?? "",
  meta_description: a.meta_description ?? "",
  focus_keyword: a.focus_keyword ?? "",
  canonical_url: a.canonical_url ?? "",
  og_image_url: a.og_image_url ?? "",
  noindex: a.noindex,
  faqs: a.faqs ?? [],
});

/** API payload: drops UI-only fields (undefined is omitted by JSON.stringify). */
const formToPayload = (form: ArticleForm) => ({
  ...form,
  slugTouched: undefined,
  publish_at_local: undefined,
  slug: form.slug || slugify(form.title),
  published_at: form.publish_at_local
    ? new Date(form.publish_at_local).toISOString()
    : null,
});

type ArticleState = "published" | "scheduled" | "draft";

const getArticleState = (
  a: Pick<Article, "status" | "published_at">,
  now: number,
): ArticleState => {
  if (a.status !== "published") return "draft";
  return a.published_at && new Date(a.published_at).getTime() > now
    ? "scheduled"
    : "published";
};

const STATE_CHIP: Record<
  ArticleState,
  { label: string; color: string; bg: string }
> = {
  published: { label: "Live", color: "#047857", bg: "#ECFDF5" },
  scheduled: { label: "Scheduled", color: "#1D4ED8", bg: "#EFF6FF" },
  draft: { label: "Draft", color: "#64748B", bg: "#F1F5F9" },
};

const TAG_SUGGESTIONS = [
  "Kerala Lottery",
  "Results",
  "Bumper",
  "Prize Claim",
  "Karunya",
  "Sthree Sakthi",
  "Win Win",
  "Nirmal",
  "Akshaya",
  "Fifty Fifty",
  "Onam Bumper",
  "Christmas Bumper",
  "Safety",
  "Tax",
];

type ToolbarItem = { label: string; Icon: typeof FormatBoldIcon } & (
  | { kind: "wrap"; before: string; after: string; placeholder: string }
  | { kind: "block"; snippet: string }
  | { kind: "upload" }
);

/** Markdown editor toolbar. */
const TOOLBAR: ToolbarItem[] = [
  {
    label: "Heading",
    Icon: TitleIcon,
    kind: "block",
    snippet: "## Section heading",
  },
  {
    label: "Bold",
    Icon: FormatBoldIcon,
    kind: "wrap",
    before: "**",
    after: "**",
    placeholder: "bold text",
  },
  {
    label: "Italic",
    Icon: FormatItalicIcon,
    kind: "wrap",
    before: "*",
    after: "*",
    placeholder: "italic text",
  },
  {
    label: "Link",
    Icon: LinkIcon,
    kind: "wrap",
    before: "[",
    after: "](/search)",
    placeholder: "link text",
  },
  {
    label: "Bullet list",
    Icon: FormatListBulletedIcon,
    kind: "block",
    snippet: "- First point\n- Second point",
  },
  {
    label: "Numbered list",
    Icon: FormatListNumberedIcon,
    kind: "block",
    snippet: "1. First step\n2. Second step",
  },
  {
    label: "Quote",
    Icon: FormatQuoteIcon,
    kind: "block",
    snippet: "> Quote text",
  },
  {
    label: "Tip / warning box",
    Icon: LightbulbIcon,
    kind: "block",
    snippet: "> [!TIP] Helpful tip for readers.",
  },
  {
    label: "Table",
    Icon: TableChartIcon,
    kind: "block",
    snippet: "| Prize | Amount |\n| --- | --- |\n| 1st | ₹1 Crore |",
  },
  { label: "Divider", Icon: HorizontalRuleIcon, kind: "block", snippet: "---" },
  { label: "Upload image", Icon: ImageIcon, kind: "upload" },
];

const errorText = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

type Toast = {
  type: "success" | "error" | "info" | "warning";
  message: string;
} | null;

// ---------------------------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------------------------

export default function ArticlesManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<ArticleState | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<ArticleCategory | "all">(
    "all",
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [initialFormJson, setInitialFormJson] = useState(
    JSON.stringify(EMPTY_FORM),
  );
  const [editorTab, setEditorTab] = useState(0);
  const [sideTab, setSideTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<
    "cover" | "inline" | null
  >(null);

  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const inlineInputRef = useRef<HTMLInputElement | null>(null);

  // ------------------------------------------------------------------ data
  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/articles", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.success)
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      setArticles(json.articles ?? []);
      setLoadError(null);
    } catch (err: unknown) {
      const message = errorText(err);
      console.error("[ArticlesManager] load failed:", message);
      setLoadError(
        `Could not load articles: ${message}. If the table does not exist yet, run supabase/migrations/20261107000000_articles_newsletter.sql in the Supabase SQL editor.`,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load; every setState inside these runs after an await (not synchronously).
    const timer = setTimeout(() => {
      fetchArticles();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchArticles]);

  // Ticks once a minute so "scheduled" badges flip to "live" without a reload.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const loadArticles = () => {
    setIsLoading(true);
    setLoadError(null);
    fetchArticles();
  };

  const stats = useMemo(
    () =>
      articles.reduce(
        (acc, a) => ({
          ...acc,
          [getArticleState(a, now)]: acc[getArticleState(a, now)] + 1,
        }),
        { published: 0, scheduled: 0, draft: 0 } as Record<
          ArticleState,
          number
        >,
      ),
    [articles, now],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (stateFilter === "all" || getArticleState(a, now) === stateFilter) &&
        (categoryFilter === "all" || a.category === categoryFilter) &&
        (!term ||
          a.title.toLowerCase().includes(term) ||
          a.slug.includes(term) ||
          a.tags.some((t) => t.toLowerCase().includes(term))),
    );
  }, [articles, search, stateFilter, categoryFilter, now]);

  // ------------------------------------------------------------------ editor helpers
  const isDirty = JSON.stringify(form) !== initialFormJson;

  const openEditor = (article?: Article, duplicate = false) => {
    const base = article ? articleToForm(article) : EMPTY_FORM;
    const next: ArticleForm = duplicate
      ? {
          ...base,
          id: undefined,
          title: `${base.title} (copy)`,
          slug: `${base.slug}-copy`,
          status: "draft",
          publish_at_local: "",
          is_featured: false,
        }
      : base;
    setForm(next);
    setInitialFormJson(JSON.stringify(next));
    setEditorTab(0);
    setSideTab(0);
    setFormError(null);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (isDirty && !window.confirm("Discard unsaved changes to this article?"))
      return;
    setEditorOpen(false);
  };

  const update = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTitleChange = (title: string) =>
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slugTouched ? prev.slug : slugify(title),
    }));

  /** Wraps the current selection (or inserts a snippet) in the Markdown textarea. */
  const insertMarkdown = (before: string, after = "", placeholder = "") => {
    const el = contentRef.current;
    const value = form.content;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    update("content", nextValue);
    requestAnimationFrame(() => {
      el?.focus();
      const cursor = start + before.length;
      el?.setSelectionRange(cursor, cursor + selected.length);
    });
  };

  const insertBlock = (snippet: string) => {
    const el = contentRef.current;
    const value = form.content;
    const pos = el?.selectionStart ?? value.length;
    const prefix =
      pos > 0 && !value.slice(0, pos).endsWith("\n\n")
        ? value.slice(0, pos).endsWith("\n")
          ? "\n"
          : "\n\n"
        : "";
    update(
      "content",
      `${value.slice(0, pos)}${prefix}${snippet}\n\n${value.slice(pos)}`,
    );
    requestAnimationFrame(() => el?.focus());
  };

  const runToolbarAction = (item: ToolbarItem) => {
    if (item.kind === "wrap")
      insertMarkdown(item.before, item.after, item.placeholder);
    else if (item.kind === "block") insertBlock(item.snippet);
    else inlineInputRef.current?.click();
  };

  const uploadImage = async (file: File, target: "cover" | "inline") => {
    setUploadingTarget(target);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/articles/upload", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (!res.ok || !json?.success)
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      if (target === "cover") {
        setForm((prev) => ({
          ...prev,
          cover_image_url: json.url,
          cover_image_alt: prev.cover_image_alt || prev.title || alt,
        }));
      } else {
        insertBlock(`![${alt}](${json.url})`);
      }
      setToast({ type: "success", message: "Image uploaded." });
    } catch (err: unknown) {
      setToast({ type: "error", message: errorText(err) });
    } finally {
      setUploadingTarget(null);
    }
  };

  const onFilePicked = (
    target: "cover" | "inline",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadImage(file, target);
  };

  const autoFillSeo = () =>
    setForm((prev) => {
      const plain = markdownToPlainText(prev.content);
      const description = (prev.excerpt || plain)
        .slice(0, SEO_LIMITS.metaDescriptionMax)
        .replace(/\s+\S*$/, "");
      return {
        ...prev,
        meta_title:
          prev.meta_title || prev.title.slice(0, SEO_LIMITS.metaTitleMax),
        meta_description: prev.meta_description || description,
        excerpt: prev.excerpt || plain.slice(0, 220).replace(/\s+\S*$/, ""),
        cover_image_alt:
          prev.cover_image_alt || (prev.cover_image_url ? prev.title : ""),
      };
    });

  const seo = useMemo(
    () =>
      evaluateSeo({
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        metaTitle: form.meta_title,
        metaDescription: form.meta_description,
        focusKeyword: form.focus_keyword,
        coverImageUrl: form.cover_image_url,
        coverImageAlt: form.cover_image_alt,
        faqCount: form.faqs.filter((f) => f.question && f.answer).length,
        tags: form.tags,
      }),
    [form],
  );
  const seoColor =
    seo.score >= 80 ? "#16A34A" : seo.score >= 50 ? "#D97706" : "#DC2626";

  // ------------------------------------------------------------------ save / delete
  const saveArticle = async (statusOverride?: "draft" | "published") => {
    const draft = statusOverride ? { ...form, status: statusOverride } : form;
    if (draft.title.trim().length < 3) {
      setFormError("Please enter a title (at least 3 characters).");
      return;
    }
    if (draft.status === "published" && countWords(draft.content) < 20) {
      setFormError("Published articles need some content (at least 20 words).");
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(draft)),
      });
      const json = await res.json();
      if (!res.ok || !json?.success)
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      const saved = json.article as Article;
      const savedForm = articleToForm(saved);
      setForm(savedForm);
      setInitialFormJson(JSON.stringify(savedForm));
      setArticles((prev) => {
        const others = prev
          .filter((a) => a.id !== saved.id)
          .map((a) => (saved.is_featured ? { ...a, is_featured: false } : a));
        return [saved, ...others];
      });
      const state = getArticleState(saved, Date.now());
      setToast({
        type: "success",
        message:
          state === "published"
            ? "Published! It is now live on the website and app."
            : state === "scheduled"
              ? `Scheduled for ${formatArticleDate(saved.published_at)}.`
              : "Draft saved.",
      });
    } catch (err: unknown) {
      setFormError(errorText(err));
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = async (article: Article) => {
    const nextStatus = article.status === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...article,
          status: nextStatus,
          published_at:
            nextStatus === "published"
              ? (article.published_at ?? new Date().toISOString())
              : article.published_at,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success)
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? json.article : a)),
      );
      setToast({
        type: "success",
        message:
          nextStatus === "published"
            ? "Article published."
            : "Article moved to drafts.",
      });
    } catch (err: unknown) {
      setToast({ type: "error", message: errorText(err) });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/articles?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!res.ok || !json?.success)
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      setArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setToast({
        type: "success",
        message: `Deleted “${deleteTarget.title}”.`,
      });
      setDeleteTarget(null);
    } catch (err: unknown) {
      setToast({ type: "error", message: errorText(err) });
    } finally {
      setIsDeleting(false);
    }
  };

  // ------------------------------------------------------------------ render helpers
  const metaTitle = effectiveMetaTitle({
    metaTitle: form.meta_title,
    title: form.title,
  });
  const metaDescription = effectiveMetaDescription({
    metaDescription: form.meta_description,
    excerpt: form.excerpt,
  });
  const words = countWords(form.content);
  const isScheduled =
    form.status === "published" &&
    form.publish_at_local &&
    new Date(form.publish_at_local).getTime() > now;

  const counter = (len: number, min: number, max: number) => (
    <Box
      component="span"
      sx={{
        color:
          len === 0
            ? "#94A3B8"
            : len < min || len > max
              ? "#DC2626"
              : "#16A34A",
        fontWeight: 700,
      }}
    >
      {len}/{max}
    </Box>
  );

  // ------------------------------------------------------------------ UI
  return (
    <Box>
      {/* Header + stats */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <NewspaperIcon sx={{ color: "#0B3C5D" }} /> Articles
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
              Posts appear on <strong>/news</strong> on the website and in the{" "}
              <strong>News</strong> screen of the mobile app.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              startIcon={<RefreshIcon />}
              variant="outlined"
              onClick={loadArticles}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "10px",
              }}
            >
              Refresh
            </Button>
            <Button
              startIcon={<AddCircleIcon />}
              variant="contained"
              onClick={() => openEditor()}
              sx={{
                fontWeight: 800,
                textTransform: "none",
                borderRadius: "10px",
                bgcolor: "#0B3C5D",
                "&:hover": { bgcolor: "#0F2C59" },
              }}
            >
              New Article
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2.5 }}>
          {(
            [
              ["all", `All (${articles.length})`],
              ["published", `Live (${stats.published})`],
              ["scheduled", `Scheduled (${stats.scheduled})`],
              ["draft", `Drafts (${stats.draft})`],
            ] as const
          ).map(([value, label]) => (
            <Chip
              key={value}
              label={label}
              onClick={() => setStateFilter(value)}
              sx={{
                fontWeight: 700,
                bgcolor: stateFilter === value ? "#0B3C5D" : "#F1F5F9",
                color: stateFilter === value ? "#FFFFFF" : "#334155",
                "&:hover": {
                  bgcolor: stateFilter === value ? "#0F2C59" : "#E2E8F0",
                },
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
          <TextField
            size="small"
            label="Search title, slug or tag"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: "1 1 260px" }}
          />
          <TextField
            size="small"
            select
            label="Category"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as ArticleCategory | "all")
            }
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All categories</MenuItem>
            {ARTICLE_CATEGORIES.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {loadError && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: "12px" }}
          action={
            <Button color="inherit" onClick={loadArticles}>
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      )}

      {/* List */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <NewspaperIcon sx={{ fontSize: 48, color: "#CBD5E1" }} />
            <Typography sx={{ fontWeight: 800, mt: 1, color: "#0F172A" }}>
              {articles.length
                ? "No articles match your filters"
                : "No articles yet"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
              Write your first post — lottery news, a bumper update or a
              how-to guide.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => openEditor()}
              sx={{
                fontWeight: 800,
                textTransform: "none",
                bgcolor: "#0B3C5D",
              }}
            >
              New Article
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontWeight: 800,
                      bgcolor: "#F8FAFC",
                      color: "#334155",
                    },
                  }}
                >
                  <TableCell>Article</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((a) => {
                  const state = getArticleState(a, now);
                  const chip = STATE_CHIP[state];
                  const category = getCategoryMeta(a.category);
                  return (
                    <TableRow key={a.id} hover>
                      <TableCell sx={{ maxWidth: 380 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          {a.cover_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                            <img
                              src={a.cover_image_url}
                              alt=""
                              style={{
                                width: 56,
                                height: 40,
                                objectFit: "cover",
                                borderRadius: 8,
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 56,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: category.bg,
                                flexShrink: 0,
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              <NewspaperIcon
                                sx={{ color: category.color, fontSize: 20 }}
                              />
                            </Box>
                          )}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: "#0F172A",
                                fontSize: "0.92rem",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                              noWrap
                            >
                              {a.is_featured && (
                                <StarIcon
                                  sx={{ fontSize: 16, color: "#D97706" }}
                                />
                              )}
                              {a.title}
                            </Typography>
                            <Typography
                              sx={{ color: "#94A3B8", fontSize: "0.78rem" }}
                              noWrap
                            >
                              {getArticlePath(a.slug)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={category.label}
                          sx={{
                            fontWeight: 700,
                            bgcolor: category.bg,
                            color: category.color,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={chip.label}
                          sx={{
                            fontWeight: 700,
                            bgcolor: chip.bg,
                            color: chip.color,
                          }}
                        />
                        {a.noindex && (
                          <Chip
                            size="small"
                            label="noindex"
                            sx={{ ml: 0.5, fontWeight: 700 }}
                          />
                        )}
                      </TableCell>
                      <TableCell
                        sx={{ whiteSpace: "nowrap", color: "#475569" }}
                      >
                        {formatArticleDate(a.published_at ?? a.updated_at)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#475569" }}>
                        {a.view_count.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openEditor(a)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            a.status === "published"
                              ? "Unpublish (move to drafts)"
                              : "Publish now"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => togglePublish(a)}
                          >
                            {a.status === "published" ? (
                              <VisibilityOffIcon fontSize="small" />
                            ) : (
                              <VisibilityIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                          <IconButton
                            size="small"
                            onClick={() => openEditor(a, true)}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {state === "published" && (
                          <Tooltip title="View live">
                            <IconButton
                              size="small"
                              component="a"
                              href={getArticlePath(a.slug)}
                              target="_blank"
                              rel="noopener"
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(a)}
                            sx={{ color: "#DC2626" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ============================== Editor ============================== */}
      <Dialog open={editorOpen} onClose={closeEditor} fullScreen>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderBottom: "1px solid #E2E8F0",
            py: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
              {form.id ? "Edit article" : "New article"}
            </Typography>
            {form.id && (
              <Chip
                size="small"
                label={
                  STATE_CHIP[
                    getArticleState(
                      {
                        status: form.status,
                        published_at: form.publish_at_local
                          ? new Date(form.publish_at_local).toISOString()
                          : null,
                      },
                      now,
                    )
                  ].label
                }
              />
            )}
            {isDirty && (
              <Chip
                size="small"
                label="Unsaved changes"
                sx={{ bgcolor: "#FEF3C7", color: "#B45309", fontWeight: 700 }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              onClick={closeEditor}
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              Close
            </Button>
            <Button
              variant="outlined"
              disabled={isSaving}
              onClick={() => saveArticle("draft")}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "10px",
              }}
            >
              Save draft
            </Button>
            <Button
              variant="contained"
              disabled={isSaving}
              onClick={() => saveArticle("published")}
              startIcon={
                isSaving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CheckCircleIcon />
                )
              }
              sx={{
                fontWeight: 800,
                textTransform: "none",
                borderRadius: "10px",
                bgcolor: "#16A34A",
                "&:hover": { bgcolor: "#15803D" },
              }}
            >
              {isScheduled
                ? "Schedule"
                : form.status === "published" && form.id
                  ? "Update"
                  : "Publish"}
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ bgcolor: "#F8FAFC", p: { xs: 1.5, md: 3 } }}>
          {formError && (
            <Alert
              severity="error"
              sx={{ my: 2, borderRadius: "12px" }}
              onClose={() => setFormError(null)}
            >
              {formError}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            {/* ---------------- main column ---------------- */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <TextField
                  label="Title"
                  placeholder="e.g. Karunya KR-725 Result: 1st Prize ₹80 Lakh Won in Thrissur"
                  fullWidth
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  slotProps={{
                    htmlInput: { maxLength: 200 },
                    input: { sx: { fontSize: "1.25rem", fontWeight: 700 } },
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="URL slug"
                  fullWidth
                  size="small"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: slugify(e.target.value),
                      slugTouched: true,
                    }))
                  }
                  helperText={`keralalotteryresultstoday.in${getArticlePath(form.slug || "your-article")}`}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Excerpt / summary (shown on cards & in search results)"
                  fullWidth
                  multiline
                  minRows={2}
                  value={form.excerpt}
                  onChange={(e) => update("excerpt", e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                  helperText={`${form.excerpt.length}/500`}
                  sx={{ mb: 2 }}
                />

                <Tabs
                  value={editorTab}
                  onChange={(_, v) => setEditorTab(v)}
                  sx={{
                    minHeight: 40,
                    "& .MuiTab-root": {
                      minHeight: 40,
                      textTransform: "none",
                      fontWeight: 700,
                    },
                  }}
                >
                  <Tab label="Write" />
                  <Tab label="Preview" />
                </Tabs>
                <Divider sx={{ mb: 1.5 }} />

                {editorTab === 0 ? (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mb: 1,
                        p: 0.5,
                        bgcolor: "#F1F5F9",
                        borderRadius: "10px",
                      }}
                    >
                      {TOOLBAR.map((item) => (
                        <Tooltip key={item.label} title={item.label}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => runToolbarAction(item)}
                              aria-label={item.label}
                              disabled={
                                item.kind === "upload" &&
                                uploadingTarget === "inline"
                              }
                            >
                              {item.kind === "upload" &&
                              uploadingTarget === "inline" ? (
                                <CircularProgress size={16} />
                              ) : (
                                <item.Icon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      ))}
                    </Box>
                    <TextField
                      inputRef={contentRef}
                      fullWidth
                      multiline
                      minRows={18}
                      placeholder={
                        "Start writing… Markdown supported:\n## Heading\n**bold**, *italic*, [link](/search)\n- list item\n> [!TIP] tip box"
                      }
                      value={form.content}
                      onChange={(e) => update("content", e.target.value)}
                      slotProps={{
                        input: {
                          sx: {
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, monospace",
                            fontSize: "0.92rem",
                            lineHeight: 1.7,
                            bgcolor: "#FFFFFF",
                          },
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748B", display: "block", mt: 1 }}
                    >
                      {words} words · ~{estimateReadingMinutes(form.content)}{" "}
                      min read
                    </Typography>
                  </>
                ) : (
                  <Box
                    sx={{
                      p: { xs: 1, md: 2 },
                      bgcolor: "#FFFFFF",
                      minHeight: 300,
                    }}
                  >
                    <Typography
                      component="h1"
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: "1.6rem", md: "2rem" },
                        color: "#0F172A",
                        mb: 2,
                        lineHeight: 1.25,
                      }}
                    >
                      {form.title || "Untitled article"}
                    </Typography>
                    {form.cover_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element -- preview
                      <img
                        src={form.cover_image_url}
                        alt={form.cover_image_alt}
                        style={{
                          width: "100%",
                          borderRadius: 14,
                          marginBottom: 24,
                        }}
                      />
                    )}
                    <ArticleContent markdown={form.content} />
                  </Box>
                )}
              </Paper>

              {/* FAQs */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  mt: 3,
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>FAQs</Typography>
                    <Typography variant="caption" sx={{ color: "#64748B" }}>
                      Shown at the end of the article and published as FAQPage
                      schema for Google & AI answers.
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<AddCircleIcon />}
                    onClick={() =>
                      update("faqs", [
                        ...form.faqs,
                        { question: "", answer: "" },
                      ])
                    }
                    sx={{ fontWeight: 700, textTransform: "none" }}
                  >
                    Add FAQ
                  </Button>
                </Box>
                {form.faqs.length === 0 && (
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                    No FAQs yet.
                  </Typography>
                )}
                {form.faqs.map((faq, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "flex-start",
                      mt: 1.5,
                    }}
                  >
                    <Box sx={{ flex: 1, display: "grid", gap: 1 }}>
                      <TextField
                        size="small"
                        label={`Question ${idx + 1}`}
                        value={faq.question}
                        onChange={(e) =>
                          update(
                            "faqs",
                            form.faqs.map((f, i) =>
                              i === idx
                                ? { ...f, question: e.target.value }
                                : f,
                            ),
                          )
                        }
                      />
                      <TextField
                        size="small"
                        label="Answer"
                        multiline
                        minRows={2}
                        value={faq.answer}
                        onChange={(e) =>
                          update(
                            "faqs",
                            form.faqs.map((f, i) =>
                              i === idx ? { ...f, answer: e.target.value } : f,
                            ),
                          )
                        }
                      />
                    </Box>
                    <IconButton
                      aria-label="Remove FAQ"
                      onClick={() =>
                        update(
                          "faqs",
                          form.faqs.filter((_, i) => i !== idx),
                        )
                      }
                      sx={{ color: "#DC2626" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Paper>
            </Grid>

            {/* ---------------- side column ---------------- */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  overflow: "hidden",
                  position: { lg: "sticky" },
                  top: { lg: 8 },
                }}
              >
                <Tabs
                  value={sideTab}
                  onChange={(_, v) => setSideTab(v)}
                  variant="fullWidth"
                  sx={{
                    borderBottom: "1px solid #E2E8F0",
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 700,
                    },
                  }}
                >
                  <Tab label="Publish" />
                  <Tab
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        SEO{" "}
                        <Box
                          component="span"
                          sx={{
                            px: 0.75,
                            borderRadius: 1,
                            bgcolor: seoColor,
                            color: "#FFF",
                            fontSize: "0.75rem",
                          }}
                        >
                          {seo.score}
                        </Box>
                      </Box>
                    }
                  />
                </Tabs>

                {sideTab === 0 ? (
                  <Box sx={{ p: 2.5, display: "grid", gap: 2 }}>
                    <TextField
                      label="Publish date & time"
                      type="datetime-local"
                      size="small"
                      value={form.publish_at_local}
                      onChange={(e) =>
                        update("publish_at_local", e.target.value)
                      }
                      slotProps={{ inputLabel: { shrink: true } }}
                      helperText={
                        isScheduled
                          ? "Future date → article goes live automatically at this time."
                          : "Leave empty to publish immediately."
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.is_featured}
                          onChange={(e) =>
                            update("is_featured", e.target.checked)
                          }
                        />
                      }
                      label={
                        <Typography sx={{ fontWeight: 700 }}>
                          Featured (hero of the feed)
                        </Typography>
                      }
                    />

                    <TextField
                      select
                      size="small"
                      label="Category"
                      value={form.category}
                      onChange={(e) =>
                        update("category", e.target.value as ArticleCategory)
                      }
                    >
                      {ARTICLE_CATEGORIES.map((c) => (
                        <MenuItem key={c.value} value={c.value}>
                          {c.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Autocomplete
                      multiple
                      freeSolo
                      size="small"
                      options={TAG_SUGGESTIONS}
                      value={form.tags}
                      onChange={(_, value) =>
                        update(
                          "tags",
                          [
                            ...new Set(
                              value.map((v) => v.trim()).filter(Boolean),
                            ),
                          ].slice(0, 15),
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tags"
                          placeholder="Type & press Enter"
                        />
                      )}
                    />

                    <TextField
                      size="small"
                      label="Author"
                      value={form.author_name}
                      onChange={(e) => update("author_name", e.target.value)}
                    />

                    <Divider />
                    <Typography sx={{ fontWeight: 800 }}>
                      Cover image
                    </Typography>
                    {form.cover_image_url ? (
                      <Box sx={{ position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- preview */}
                        <img
                          src={form.cover_image_url}
                          alt={form.cover_image_alt}
                          style={{
                            width: "100%",
                            aspectRatio: "1200 / 630",
                            objectFit: "cover",
                            borderRadius: 12,
                            display: "block",
                          }}
                        />
                        <Button
                          size="small"
                          variant="contained"
                          color="inherit"
                          onClick={() => update("cover_image_url", "")}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            textTransform: "none",
                            fontWeight: 700,
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={
                          uploadingTarget === "cover" ? (
                            <CircularProgress size={16} />
                          ) : (
                            <CloudUploadIcon />
                          )
                        }
                        disabled={uploadingTarget === "cover"}
                        onClick={() => coverInputRef.current?.click()}
                        sx={{
                          py: 3,
                          borderStyle: "dashed",
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: "12px",
                        }}
                      >
                        Upload cover (1200×630 recommended)
                      </Button>
                    )}
                    <TextField
                      size="small"
                      label="…or paste image URL"
                      value={form.cover_image_url}
                      onChange={(e) =>
                        update("cover_image_url", e.target.value.trim())
                      }
                    />
                    <TextField
                      size="small"
                      label="Cover alt text"
                      value={form.cover_image_alt}
                      onChange={(e) =>
                        update("cover_image_alt", e.target.value)
                      }
                      helperText="Describe the image for screen readers & image search."
                    />
                  </Box>
                ) : (
                  <Box sx={{ p: 2.5, display: "grid", gap: 2 }}>
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography sx={{ fontWeight: 800 }}>
                          SEO score
                        </Typography>
                        <Typography sx={{ fontWeight: 900, color: seoColor }}>
                          {seo.score}/100
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={seo.score}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "#E2E8F0",
                          "& .MuiLinearProgress-bar": { bgcolor: seoColor },
                        }}
                      />
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AutoFixHighIcon />}
                      onClick={autoFillSeo}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: "10px",
                      }}
                    >
                      Auto-fill empty SEO fields from content
                    </Button>

                    <TextField
                      size="small"
                      label="Focus keyword"
                      value={form.focus_keyword}
                      onChange={(e) => update("focus_keyword", e.target.value)}
                      placeholder="e.g. karunya lottery result"
                    />
                    <TextField
                      size="small"
                      label="SEO title"
                      value={form.meta_title}
                      onChange={(e) => update("meta_title", e.target.value)}
                      placeholder={form.title}
                      slotProps={{ htmlInput: { maxLength: 120 } }}
                      helperText={
                        <>
                          Defaults to the article title ·{" "}
                          {counter(
                            metaTitle.length,
                            SEO_LIMITS.metaTitleMin,
                            SEO_LIMITS.metaTitleMax,
                          )}
                        </>
                      }
                    />
                    <TextField
                      size="small"
                      label="Meta description"
                      multiline
                      minRows={3}
                      value={form.meta_description}
                      onChange={(e) =>
                        update("meta_description", e.target.value)
                      }
                      placeholder={form.excerpt}
                      slotProps={{ htmlInput: { maxLength: 320 } }}
                      helperText={
                        <>
                          Defaults to the excerpt ·{" "}
                          {counter(
                            metaDescription.length,
                            SEO_LIMITS.metaDescriptionMin,
                            SEO_LIMITS.metaDescriptionMax,
                          )}
                        </>
                      }
                    />

                    {/* Google SERP preview */}
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #E2E8F0",
                        borderRadius: "12px",
                        bgcolor: "#FFFFFF",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748B", fontWeight: 700 }}
                      >
                        Google preview
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.8rem", color: "#202124", mt: 0.5 }}
                        noWrap
                      >
                        keralalotteryresultstoday.in › news ›{" "}
                        {form.slug || "your-article"}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#1A0DAB",
                          fontSize: "1.1rem",
                          lineHeight: 1.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {metaTitle || "Article title"} | Kerala Lottery
                      </Typography>
                      <Typography
                        sx={{
                          color: "#4D5156",
                          fontSize: "0.85rem",
                          lineHeight: 1.5,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {metaDescription ||
                          "Add a meta description to control the snippet shown in search results."}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "grid", gap: 0.75 }}>
                      {seo.checks.map((check) => (
                        <Tooltip
                          key={check.id}
                          title={check.hint}
                          placement="left"
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "flex-start",
                            }}
                          >
                            {check.passed ? (
                              <CheckCircleIcon
                                sx={{ fontSize: 18, color: "#16A34A", mt: 0.1 }}
                              />
                            ) : (
                              <RadioButtonUncheckedIcon
                                sx={{ fontSize: 18, color: "#CBD5E1", mt: 0.1 }}
                              />
                            )}
                            <Typography
                              sx={{
                                fontSize: "0.85rem",
                                color: check.passed ? "#334155" : "#64748B",
                              }}
                            >
                              {check.label}
                            </Typography>
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>

                    <Divider />
                    <Typography sx={{ fontWeight: 800 }}>Advanced</Typography>
                    <TextField
                      size="small"
                      label="Social share image URL (OG)"
                      value={form.og_image_url}
                      onChange={(e) =>
                        update("og_image_url", e.target.value.trim())
                      }
                      helperText="Defaults to the cover image."
                    />
                    <TextField
                      size="small"
                      label="Canonical URL"
                      value={form.canonical_url}
                      onChange={(e) =>
                        update("canonical_url", e.target.value.trim())
                      }
                      helperText="Only set if this content was first published elsewhere."
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.noindex}
                          onChange={(e) => update("noindex", e.target.checked)}
                        />
                      }
                      label="Hide from search engines (noindex)"
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(e) => onFilePicked("cover", e)}
          />
          <input
            ref={inlineInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(e) => onFilePicked("inline", e)}
          />
        </DialogContent>
      </Dialog>

      {/* ============================== Delete confirm ============================== */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete article?</DialogTitle>
        <DialogContent>
          <Typography>
            “<strong>{deleteTarget?.title}</strong>” will be permanently removed
            from the website and the app. This cannot be undone.
          </Typography>
          {deleteTarget?.status === "published" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Tip: use <strong>Unpublish</strong> instead if you may want it
              back later.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
            sx={{ fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            disabled={isDeleting}
            variant="contained"
            color="error"
            sx={{ fontWeight: 800 }}
          >
            {isDeleting ? "Deleting…" : "Delete permanently"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert
            severity={toast.type}
            onClose={() => setToast(null)}
            variant="filled"
            sx={{ fontWeight: 700 }}
          >
            {toast.message}
          </Alert>
        ) : (
          <span />
        )}
      </Snackbar>
    </Box>
  );
}
