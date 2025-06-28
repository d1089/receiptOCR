import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Button,
  useTheme,
} from "@mui/material";
import { Receipt, Upload, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/upload", label: "Upload", icon: Upload },
    { path: "/receipts", label: "Receipts", icon: Receipt },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: theme.palette.primary.main }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/")}
            sx={{ mr: 2 }}
          >
            <Receipt />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            ReceiptOCR
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  startIcon={<Icon size={18} />}
                  sx={{
                    backgroundColor: isActive
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          backgroundColor: theme.palette.grey[100],
          py: 3,
          mt: "auto",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 ReceiptOCR. Built with React & Material-UI.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
