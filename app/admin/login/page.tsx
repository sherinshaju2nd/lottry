"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CircularProgress from "@mui/material/CircularProgress";

const loginSchema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        router.push("/admin");
      } else {
        setErrorMsg(json.error || "Invalid username or password");
      }
    } catch {
      setErrorMsg("Failed to connect to authentication server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: "4px", border: "1px solid #E5E7EB", textAlign: "center" }}>
        <Box sx={{ bgcolor: "#2E7D32", color: "white", width: 44, height: 44, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
          <LockOutlinedIcon />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>
          Admin Login
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
          Sign in to trigger manual API fetch and manage draw data.
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "4px" }}>
            {errorMsg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            {...register("username")}
            label="Username"
            fullWidth
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          <TextField
            {...register("password")}
            label="Password"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            disabled={isLoading}
            variant="contained"
            size="large"
            sx={{ bgcolor: "#2E7D32", py: 1.5, fontWeight: 700, borderRadius: "4px", "&:hover": { bgcolor: "#1B5E20" } }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In to Admin"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
