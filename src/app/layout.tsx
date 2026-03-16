import "./globals.css";

export const metadata = {
  title: "Budget Plan Pro",
  description: "AI-powered household money planning for couples and families",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
