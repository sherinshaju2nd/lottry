"use client";

import React, { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import { StructuredDrawResult } from "@/lib/supabase";

interface AiGazettePdfUploaderProps {
  open: boolean;
  onClose: () => void;
  onResultExtracted: (drawData: StructuredDrawResult) => void;
}

export default function AiGazettePdfUploader({
  open,
  onClose,
  onResultExtracted,
}: AiGazettePdfUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<StructuredDrawResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMsg(null);
      setParsedData(null);
      setSuccessMsg(null);
    }
  };

  const handleExtractWithAi = async () => {
    if (!selectedFile) {
      setErrorMsg("Please select an official PDF or result sheet image.");
      return;
    }

    setIsParsing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;

        const res = await fetch("/api/admin/ai-parse-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64: base64Data,
            mimeType: selectedFile.type || "application/pdf",
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to extract result data from document.");
        }

        setParsedData(json.data);
        setSuccessMsg("Document parsed successfully by Gemini AI!");
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setErrorMsg(err.message || "Error reading file.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyAndSave = () => {
    if (parsedData) {
      onResultExtracted(parsedData);
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedData(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "20px",
            p: 1,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ color: "#D97706" }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1E293B" }}>
            Gemini AI Automated Gazette PDF Result Ingestion
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5 }}>
        <Typography variant="body2" sx={{ color: "#64748B", mb: 3 }}>
          Upload the official daily Kerala State Lottery Gazette result PDF or scanned sheet. Gemini Multimodal AI will extract all 8 prize tiers, consolation numbers, agent details, and draw codes in seconds.
        </Typography>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf,image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Upload Dropzone Box */}
        <Paper
          elevation={0}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            p: 4,
            border: "2px dashed #CBD5E1",
            borderRadius: "16px",
            textAlign: "center",
            cursor: "pointer",
            bgcolor: selectedFile ? "#F0FDF4" : "#F8FAFC",
            borderColor: selectedFile ? "#22C55E" : "#CBD5E1",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "#0B3C5D",
              bgcolor: "#F1F5F9",
            },
            mb: 3,
          }}
        >
          {selectedFile ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <PictureAsPdfIcon sx={{ fontSize: 48, color: "#2E7D32" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#166534" }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748B" }}>
                {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose different file
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <UploadFileIcon sx={{ fontSize: 48, color: "#0B3C5D" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1E293B" }}>
                Click to browse or drop Kerala Gazette PDF / Result Image
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                Supports official PDF documents and high-res PNG/JPG images
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Extract Button */}
        {selectedFile && !parsedData && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              disabled={isParsing}
              onClick={handleExtractWithAi}
              startIcon={isParsing ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
              sx={{
                bgcolor: "#0B3C5D",
                color: "#FFFFFF",
                fontWeight: 800,
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                "&:hover": { bgcolor: "#0F2C59" },
              }}
            >
              {isParsing ? "Gemini AI Extracting Result Data..." : "Extract Draw Results with Gemini AI"}
            </Button>
          </Box>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: "10px" }}>
            {successMsg}
          </Alert>
        )}

        {/* Extracted Data Preview */}
        {parsedData && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "16px",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
                Extracted Gazette Results Preview
              </Typography>
              <Chip
                icon={<CheckCircleIcon />}
                label="AI Verified"
                color="success"
                size="small"
                sx={{ fontWeight: 800 }}
              />
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
              <Chip label={`Draw: ${parsedData.draw_name} (${parsedData.draw_code})`} sx={{ fontWeight: 700 }} />
              <Chip label={`Date: ${parsedData.draw_date}`} variant="outlined" sx={{ fontWeight: 700 }} />
              <Chip label={`1st Prize: ${parsedData.first?.ticket || "N/A"}`} color="warning" sx={{ fontWeight: 800 }} />
              {parsedData.first?.location && (
                <Chip label={`Location: ${parsedData.first.location}`} variant="outlined" />
              )}
            </Box>

            <Typography variant="caption" sx={{ color: "#64748B", display: "block", mb: 1 }}>
              Prize Breakdown Extracted:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {parsedData.prizes?.consolation?.length ? (
                <Chip label={`Consolation: ${parsedData.prizes.consolation.length} tickets`} size="small" />
              ) : null}
              {parsedData.prizes?.["2nd"]?.length ? (
                <Chip label={`2nd Prize: ${parsedData.prizes["2nd"].length} tickets`} size="small" />
              ) : null}
              {parsedData.prizes?.["3rd"]?.length ? (
                <Chip label={`3rd Prize: ${parsedData.prizes["3rd"].length} numbers`} size="small" />
              ) : null}
              {parsedData.prizes?.["4th"]?.length ? (
                <Chip label={`4th Prize: ${parsedData.prizes["4th"].length} numbers`} size="small" />
              ) : null}
              {parsedData.prizes?.["5th"]?.length ? (
                <Chip label={`5th Prize: ${parsedData.prizes["5th"].length} numbers`} size="small" />
              ) : null}
              {parsedData.prizes?.["6th"]?.length ? (
                <Chip label={`6th Prize: ${parsedData.prizes["6th"].length} numbers`} size="small" />
              ) : null}
              {parsedData.prizes?.["7th"]?.length ? (
                <Chip label={`7th Prize: ${parsedData.prizes["7th"].length} numbers`} size="small" />
              ) : null}
              {parsedData.prizes?.["8th"]?.length ? (
                <Chip label={`8th Prize: ${parsedData.prizes["8th"].length} numbers`} size="small" />
              ) : null}
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
        <Button onClick={handleReset} sx={{ color: "#64748B", fontWeight: 700 }}>
          Reset File
        </Button>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button onClick={onClose} sx={{ color: "#475569", fontWeight: 700 }}>
            Cancel
          </Button>
          {parsedData && (
            <Button
              variant="contained"
              onClick={handleApplyAndSave}
              startIcon={<SaveIcon />}
              sx={{
                bgcolor: "#2E7D32",
                color: "#FFFFFF",
                fontWeight: 800,
                borderRadius: "10px",
                "&:hover": { bgcolor: "#1B5E20" },
              }}
            >
              Load into Form & Save to Database
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
