"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ClearIcon from "@mui/icons-material/Clear";

interface ModernDatePickerProps {
  value: string; // YYYY-MM-DD or ""
  onChange: (dateStr: string) => void;
  label?: string;
  publishedDates?: string[]; // List of YYYY-MM-DD dates with draw results
}

export default function ModernDatePicker({
  value,
  onChange,
  label = "Select Draw Date",
  publishedDates = [],
}: ModernDatePickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Calendar navigation state
  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const open = Boolean(anchorEl);

  const handleClickField = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    handleClose();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Quick helper dates
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split("T")[0];

  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split("T")[0];

  // Month navigation
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarCells: Array<{ day: number | null; dateStr: string }> = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({ day: null, dateStr: "" });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const monthFormatted = String(viewMonth + 1).padStart(2, "0");
    const dayFormatted = String(d).padStart(2, "0");
    const dateStr = `${viewYear}-${monthFormatted}-${dayFormatted}`;
    calendarCells.push({ day: d, dateStr });
  }

  const formatDisplay = (dStr: string) => {
    if (!dStr) return "";
    const [y, m, dayNum] = dStr.split("-");
    const monthNameShort = monthNames[parseInt(m, 10) - 1]?.slice(0, 3) || m;
    return `${dayNum} ${monthNameShort} ${y}`;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        onClick={handleClickField}
        label={label}
        value={formatDisplay(value)}
        placeholder="All Published Dates"
        fullWidth
        variant="outlined"
        slotProps={{
          input: {
            readOnly: true,
            startAdornment: <CalendarMonthIcon sx={{ color: "#0F5A24", mr: 1, cursor: "pointer" }} />,
            endAdornment: value ? (
              <IconButton size="small" onClick={handleClear} sx={{ color: "#6B7280" }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null,
          },
        }}
        sx={{
          cursor: "pointer",
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            bgcolor: "#FFFFFF",
            cursor: "pointer",
            "&:hover fieldset": { borderColor: "#0F5A24" },
            "&.Mui-focused fieldset": { borderColor: "#0F5A24" },
          },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              width: 330,
              borderRadius: "16px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
              overflow: "hidden",
              border: "1px solid #E5E7EB",
              mt: 1,
            },
          },
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #0F5A24 0%, #15803D 100%)",
            color: "#FFFFFF",
            p: 2.5,
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.8, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>
            Select Draw Date
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 900, mt: 0.5 }}>
            {value ? formatDisplay(value) : "All Published Dates"}
          </Typography>
        </Box>

        {/* Quick Shortcut Buttons */}
        <Box sx={{ p: 1.5, bgcolor: "#F9FAFB", display: "flex", gap: 1, flexWrap: "wrap", borderBottom: "1px solid #E5E7EB" }}>
          <Chip
            label="⚡ Today"
            size="small"
            onClick={() => handleSelectDate(todayStr)}
            sx={{
              bgcolor: value === todayStr ? "#0F5A24" : "#FFFFFF",
              color: value === todayStr ? "#FFFFFF" : "#374151",
              fontWeight: 700,
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              "&:hover": { bgcolor: "#E8F5E9", color: "#0F5A24" },
            }}
          />
          <Chip
            label="⏮ Yesterday"
            size="small"
            onClick={() => handleSelectDate(yesterdayStr)}
            sx={{
              bgcolor: value === yesterdayStr ? "#0F5A24" : "#FFFFFF",
              color: value === yesterdayStr ? "#FFFFFF" : "#374151",
              fontWeight: 700,
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              "&:hover": { bgcolor: "#E8F5E9", color: "#0F5A24" },
            }}
          />
          <Chip
            label="All Dates"
            size="small"
            onClick={() => handleSelectDate("")}
            sx={{
              bgcolor: !value ? "#0F5A24" : "#FFFFFF",
              color: !value ? "#FFFFFF" : "#374151",
              fontWeight: 700,
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              "&:hover": { bgcolor: "#E8F5E9", color: "#0F5A24" },
            }}
          />
        </Box>

        {/* Published Dates Section */}
        {publishedDates.length > 0 && (
          <Box sx={{ p: 1.5, bgcolor: "#FFFFFF", borderBottom: "1px solid #F3F4F6" }}>
            <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 800, mb: 1, display: "block" }}>
              PUBLISHED DRAW DATES IN SYSTEM:
            </Typography>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", maxHeight: 70, overflowY: "auto" }}>
              {publishedDates.slice(0, 6).map((pDate) => (
                <Chip
                  key={pDate}
                  label={pDate}
                  size="small"
                  onClick={() => handleSelectDate(pDate)}
                  sx={{
                    bgcolor: value === pDate ? "#0F5A24" : "#FEF3C7",
                    color: value === pDate ? "#FFFFFF" : "#92400E",
                    fontWeight: 800,
                    fontSize: "0.725rem",
                    cursor: "pointer",
                    border: "1px solid #FDE68A",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Calendar Navigation Controls */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <IconButton size="small" onClick={handlePrevMonth} sx={{ border: "1px solid #E5E7EB" }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827" }}>
              {monthNames[viewMonth]} {viewYear}
            </Typography>
            <IconButton size="small" onClick={handleNextMonth} sx={{ border: "1px solid #E5E7EB" }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Days Header */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 1, textAlign: "center" }}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
              <Typography key={dayName} variant="caption" sx={{ color: "#9CA3AF", fontWeight: 800 }}>
                {dayName}
              </Typography>
            ))}
          </Box>

          {/* Days Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, textAlign: "center" }}>
            {calendarCells.map((cell, idx) => {
              if (!cell.day) {
                return <Box key={idx} sx={{ height: 32 }} />;
              }

              const isSelected = value === cell.dateStr;
              const hasDraw = publishedDates.includes(cell.dateStr);

              return (
                <Box
                  key={cell.dateStr}
                  onClick={() => handleSelectDate(cell.dateStr)}
                  sx={{
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontSize: "0.825rem",
                    fontWeight: isSelected || hasDraw ? 800 : 500,
                    bgcolor: isSelected ? "#0F5A24" : hasDraw ? "#E8F5E9" : "transparent",
                    color: isSelected ? "#FFFFFF" : hasDraw ? "#0F5A24" : "#374151",
                    border: hasDraw && !isSelected ? "1px solid #A5D6A7" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    position: "relative",
                    "&:hover": {
                      bgcolor: isSelected ? "#0F5A24" : "#F3F4F6",
                    },
                  }}
                >
                  {cell.day}
                  {hasDraw && !isSelected && (
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        bgcolor: "#0F5A24",
                        position: "absolute",
                        bottom: 3,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Button
            size="small"
            fullWidth
            onClick={() => handleSelectDate("")}
            sx={{ color: "#6B7280", fontWeight: 700 }}
          >
            Clear Selected Date Filter
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
