import Head from 'next/head';

export default function Layout({ children, title = 'Xeno Analytics Dashboard' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Multi-tenant Shopify analytics dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{children}</main>
    </>
  );
}