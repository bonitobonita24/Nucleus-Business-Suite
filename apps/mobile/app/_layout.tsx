// ─────────────────────────────────────────────────────────────────────────────
// Root Layout — Expo Router
// All screens are declared under apps/mobile/app/
// ─────────────────────────────────────────────────────────────────────────────

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
