import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Multi-tenant Shopify Analytics Dashboard" />
        <meta name="keywords" content="shopify, analytics, dashboard, ecommerce, business intelligence" />
        <meta name="author" content="Achuth" />
        <meta property="og:title" content="Shopify Analytics Dashboard" />
        <meta property="og:description" content="Multi-tenant Shopify analytics platform" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}