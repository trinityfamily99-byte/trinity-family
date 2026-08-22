export const metadata = {
  title: "Trinity Family",
  description: "Trinity Family — Your trusted online shopping store.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
