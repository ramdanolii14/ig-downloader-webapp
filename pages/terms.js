import Head from 'next/head';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service - Instagram Downloader</title>
        <meta name="description" content="Terms of Service for the Instagram Downloader tool." />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="legal-page">
        <a href="/" className="back-link">
          Back to home
        </a>

        <h1>Terms of Service</h1>
        <p className="updated">Last updated: July 2026</p>

        <p>
          These Terms of Service govern your use of this Instagram downloader website (referred
          to here as "this site" or "the service"). By opening this site and using any part of it,
          you agree to the terms written below. If you do not agree with them, please stop using
          the service.
        </p>

        <h2>1. What this service does</h2>
        <p>
          This site lets a visitor paste the link of a public Instagram post, reel, or IGTV video
          and retrieve the media files attached to that post, such as photos and videos, so they
          can be saved to a device. The site works only with content that the Instagram account
          owner has set to public. It does not work with private accounts, and it does not ask
          for or store any Instagram login credentials.
        </p>

        <h2>2. Not affiliated with Instagram or Meta</h2>
        <p>
          This service is built and operated independently. It is not created, sponsored, endorsed,
          or in any way officially connected to Instagram, Meta Platforms Inc, or any of their
          subsidiaries or affiliates. All trademarks, logos, and brand names referenced on this
          site, including "Instagram," belong to their respective owners and are used here only to
          describe the purpose of the tool.
        </p>

        <h2>3. Who can use this service</h2>
        <p>
          This service is meant for general use by anyone old enough to use Instagram itself under
          Instagram's own terms, and old enough under the law of their country to enter into an
          agreement like this one. If local law in your area requires a higher minimum age to use
          tools like this, that requirement applies and you should not use the service if you do
          not meet it.
        </p>

        <h2>4. Acceptable use</h2>
        <p>When using this service, you agree that you will not:</p>
        <ul>
          <li>Use it to download content from private accounts through unauthorized means.</li>
          <li>
            Use it to collect, store, or redistribute large volumes of other people's content in a
            way that violates Instagram's own terms of service or applicable copyright law.
          </li>
          <li>
            Use automated scripts, bots, or scraping tools to send an excessive number of requests
            to this site in a way that could disrupt or overload it.
          </li>
          <li>Use downloaded content to harass, defame, impersonate, or harm another person.</li>
          <li>
            Use the service for any purpose that is illegal where you live or where the content
            owner lives.
          </li>
          <li>
            Attempt to reverse engineer, interfere with, or bypass any security or rate limiting
            measure on this site or on the third party services it relies on.
          </li>
        </ul>

        <h2>5. Ownership of downloaded content</h2>
        <p>
          This service does not claim any ownership over the photos, videos, captions, or any
          other material you download through it. That content remains the property of whoever
          originally created and posted it on Instagram. Downloading a file through this site does
          not give you a license to publish it elsewhere, use it commercially, or claim it as your
          own work. You are personally responsible for how you use anything you download here, and
          for making sure that use respects the original creator's rights, including copyright and
          any applicable privacy rights.
        </p>

        <h2>6. Reliance on third party services</h2>
        <p>
          To fetch media files, this site may send requests to Instagram's own servers directly, or
          to third party media retrieval services operated by other companies. Those third parties
          operate under their own terms and privacy practices, which this site does not control.
          Because Instagram can change how its platform works at any time, and because third party
          providers can change or discontinue their services at any time, there may be periods
          where a particular post cannot be fetched, or where the service is temporarily unavailable
          or limited.
        </p>

        <h2>7. No warranty</h2>
        <p>
          This service is provided on an "as is" and "as available" basis, without warranties of
          any kind, whether express or implied. This includes, without limitation, any implied
          warranty of merchantability, fitness for a particular purpose, accuracy, or
          non-infringement. There is no guarantee that the service will be uninterrupted, timely,
          secure, or free of errors, or that any particular post will successfully be retrieved.
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, the operator of this site will not be liable for
          any indirect, incidental, special, consequential, or punitive damages, or for any loss of
          data, revenue, goodwill, or other intangible losses, arising out of or connected to your
          use of, or inability to use, this service. This applies even if the operator has been
          advised of the possibility of such damages. Your use of this service is at your own risk,
          and you are solely responsible for any consequences that follow from downloading and
          using content through it.
        </p>

        <h2>9. Changes to the service</h2>
        <p>
          The features, appearance, and availability of this site may change over time without
          prior notice. Parts of the service may be added, modified, or removed at any point, for
          any reason, including changes made necessary by shifts in Instagram's platform or in the
          availability of third party providers this site relies on.
        </p>

        <h2>10. Changes to these terms</h2>
        <p>
          These terms may be updated from time to time. When changes are made, the "last updated"
          date near the top of this page will be revised. Continuing to use the service after an
          update means you accept the revised terms. If you disagree with a change, the only
          available option is to stop using the service.
        </p>

        <h2>11. Termination</h2>
        <p>
          Access to this service may be limited, suspended, or blocked for any visitor or group of
          visitors at any time, particularly in cases of abuse, excessive automated use, or
          activity that violates these terms.
        </p>

        <h2>12. Governing law</h2>
        <p>
          These terms are intended to be interpreted in a reasonable and good faith manner. Where a
          specific governing law needs to be identified for a formal dispute, the law of the
          jurisdiction where the service operator resides will apply, unless local consumer
          protection law in your own country requires otherwise.
        </p>

        <h2>13. Contact</h2>
        <p>
          Questions about these terms can be directed to{' '}
          <a href="mailto:developer@nyanpixel.my.id">developer@nyanpixel.my.id</a>.
        </p> 
      </main>

      <style jsx>{`
        :global(body) {
          margin: 0;
          background: #efece4;
        }

        .legal-page {
          font-family: 'Inter', Arial, sans-serif;
          color: #1c1b18;
          max-width: 760px;
          margin: 0 auto;
          padding: 48px 24px 96px;
          line-height: 1.65;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 32px;
          color: #2f3b58;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 32px;
          margin: 0 0 8px;
        }

        .updated {
          color: #6b6a63;
          font-size: 13px;
          margin: 0 0 32px;
        }

        h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 19px;
          margin: 36px 0 12px;
        }

        p {
          font-size: 15px;
          margin: 0 0 14px;
        }

        ul {
          padding-left: 20px;
          margin: 0 0 14px;
        }

        li {
          font-size: 15px;
          margin-bottom: 8px;
        }

        a {
          color: #2f3b58;
        }
      `}</style>
    </>
  );
}
