import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ThemeRegistry from "@/theme/ThemeRegistry";

export const metadata = {
  title: "Bondebussen",
  description: "Missa inte bussen",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AppBar position="fixed" sx={{ zIndex: 2000 }}>
            <Toolbar sx={{ backgroundColor: "background.paper" }}>
              <DashboardIcon
                sx={{ color: "#F44", mr: 2, transform: "translateY(-2px)" }}
              />
              <Typography variant="h6" color="text.primary">
                Bondebussen
              </Typography>
            </Toolbar>
          </AppBar>
          <Container
            maxWidth="md"
            // component="main"
            sx={{
              flexGrow: 1,
              bgcolor: "background.default",
              mt: ["48px", "64px"],
              p: 3,
            }}
          >
            {children}
          </Container>
        </ThemeRegistry>
      </body>
    </html>
  );
}
