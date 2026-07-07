import Head from 'next/head';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Instagram Downloader</title>
        <meta name="description" content="Privacy Policy for the Instagram Downloader tool." />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="legal-page">
        <a href="/" className="back-link">
          Back to home
        </a>

        <h1>Privacy Policy</h1>
        <p className="updated">Last updated: July 2026</p>

        <p>
          This Privacy Policy ("Policy") describes how personal data is collected, used, disclosed,
          and otherwise processed in connection with the operation of this website and the
          Instagram media retrieval service made available through it (together, the "Service").
          This Policy is intended to be read alongside the Terms of Service, and it is drafted to
          set out the basis on which any personal data collected from or about users ("you," "your,"
          or "Data Subject") is processed, consistent with applicable data protection law, including
          without limitation the General Data Protection Regulation (EU) 2016/679 ("GDPR"), the
          United Kingdom's data protection framework retaining GDPR principles ("UK GDPR"), the
          California Consumer Privacy Act as amended by the California Privacy Rights Act ("CCPA"),
          and Indonesia's Law No. 27 of 2022 on Personal Data Protection ("UU PDP"), to the extent
          any such law applies to a given Data Subject or to the processing described herein.
        </p>

        <h2>1. Definitions</h2>
        <p>
          For the purposes of this Policy, the following terms carry the meanings given below,
          without prejudice to any narrower or broader definition given to an equivalent term under
          applicable law.
        </p>
        <p>
          <strong>"Personal Data"</strong> means any information relating to an identified or
          identifiable natural person, including identifiers such as an IP address, where that
          information is capable of being linked, directly or indirectly, to that person.
        </p>
        <p>
          <strong>"Processing"</strong> means any operation performed on Personal Data, whether or
          not by automated means, including collection, recording, storage, use, disclosure,
          transmission, or erasure.
        </p>
        <p>
          <strong>"Controller"</strong> means the natural or legal person who determines the
          purposes and means of the Processing of Personal Data, which in the case of this Service
          is the individual operator identified in Section 15 of this Policy.
        </p>
        <p>
          <strong>"Processor"</strong> and <strong>"Sub-processor"</strong> mean, respectively, a
          third party that processes Personal Data on behalf of the Controller, and a further third
          party engaged by a Processor to carry out specific processing activities on the
          Controller's behalf.
        </p>
        <p>
          <strong>"Submitted URL"</strong> means the Instagram post, reel, or IGTV link that a user
          enters into the input field of the Service.
        </p>

        <h2>2. Identity of the Controller</h2>
        <p>
          The Controller responsible for determining the purposes and means of the Processing
          described in this Policy is the individual operator of this Service, Ramdan Olii,
          reachable at <a href="mailto:developer@nyanpixel.my.id">developer@nyanpixel.my.id</a>. No
          separate corporate entity, data processing agent, or appointed Data Protection Officer
          operates this Service unless expressly stated otherwise on this page.
        </p>

        <h2>3. Categories of Personal Data Processed</h2>
        <p>3.1. <strong>Data voluntarily submitted by the user.</strong> The only data field the
          Service actively solicits from a user is the Submitted URL. The Submitted URL, being a
          publicly accessible Instagram address, does not itself typically constitute sensitive
          Personal Data of the user submitting it, although it may indirectly reference a third
          party Instagram account, including that of the user or of another individual.
        </p>
        <p>
          3.2. <strong>Data collected automatically.</strong> In the ordinary course of serving web
          requests, the infrastructure underlying this Service may automatically log technical data
          associated with each request, which can include the originating IP address, browser user
          agent string, request timestamp, HTTP referrer header, requested path, and response
          status code. This category of data may constitute Personal Data under GDPR and equivalent
          frameworks to the extent an IP address is capable of being linked to an identifiable
          individual.
        </p>
        <p>
          3.3. <strong>Data the Service does not collect.</strong> The Service does not operate a
          user account or authentication system, does not request or store Instagram usernames or
          passwords belonging to the user, does not collect payment information, and does not
          request government identification, precise geolocation, biometric data, or any special
          category of Personal Data as defined under Article 9 GDPR.
        </p>

        <h2>4. Legal Basis for Processing</h2>
        <p>
          4.1. Where GDPR, UK GDPR, or an equivalent framework applies, the Service relies on the
          following legal bases for Processing, as applicable to each category of data described in
          Section 3:
        </p>
        <ul>
          <li>
            <strong>Performance of a request initiated by the Data Subject</strong> (Article 6(1)(b)
            GDPR, to the extent the interaction is treated as a request for a specific service),
            for the Processing of the Submitted URL for the purpose of retrieving the associated
            media.
          </li>
          <li>
            <strong>Legitimate interests</strong> (Article 6(1)(f) GDPR), for the Processing of
            automatically collected technical data described in Section 3.2, where such interests
            consist of maintaining the security, stability, and proper functioning of the Service,
            detecting and preventing abuse, and diagnosing technical faults, and where those
            interests are not overridden by the fundamental rights and freedoms of the Data Subject.
          </li>
          <li>
            <strong>Compliance with a legal obligation</strong> (Article 6(1)(c) GDPR), where
            Processing or disclosure of data is required to comply with applicable law, regulation,
            legal process, or enforceable governmental request.
          </li>
        </ul>
        <p>
          4.2. Where CCPA applies, the categories of Personal Data described in Section 3 are
          collected and used for the business purposes described in Section 5, and are not sold or
          shared, as those terms are defined under CCPA, in exchange for monetary or other valuable
          consideration.
        </p>

        <h2>5. Purposes of Processing</h2>
        <p>Personal Data described in Section 3 is processed for the following purposes:</p>
        <ul>
          <li>To receive a Submitted URL and use it to retrieve the corresponding media file or
            files for display and download to the requesting user.</li>
          <li>To maintain, secure, monitor, and troubleshoot the technical operation of the
            Service.</li>
          <li>To detect, investigate, and prevent fraud, abuse, excessive automated requests, or
            activity that violates the Terms of Service.</li>
          <li>To comply with applicable legal obligations, respond to lawful requests from public
            authorities, and establish, exercise, or defend legal claims.</li>
        </ul>
        <p>
          Personal Data is not used for behavioral advertising, is not used to build a marketing
          profile of any Data Subject, and is not used for any automated decision-making, including
          profiling, that produces legal effects concerning a Data Subject or similarly
          significantly affects a Data Subject, within the meaning of Article 22 GDPR.
        </p>

        <h2>6. Recipients and Sub-processors</h2>
        <p>
          6.1. To fulfil a media retrieval request, the Submitted URL, or data derived from it such
          as a post shortcode, may be transmitted to one or more of the following categories of
          recipients, each acting in relation to that specific transmission as an independent
          Controller or Processor of the data it receives, under its own privacy terms:
        </p>
        <ul>
          <li>
            <strong>Meta Platforms, Inc.</strong>, operator of Instagram, insofar as the Service
            communicates directly with Instagram's publicly accessible infrastructure to retrieve
            media associated with a public post.
          </li>
          <li>
            <strong>Third party media retrieval API providers</strong> engaged by the Controller
            from time to time, which at the time of this Policy's last update may include providers
            accessed through the RapidAPI marketplace and the service known as SocialKit, each of
            which receives the Submitted URL or an equivalent identifier for the sole purpose of
            returning media data to the Service.
          </li>
          <li>
            <strong>Hosting and infrastructure providers</strong> that host, deploy, and serve this
            Service, which may process automatically collected technical data described in Section
            3.2 as part of providing their infrastructure services.
          </li>
        </ul>
        <p>
          6.2. The Controller does not control, and disclaims responsibility for, the independent
          Processing practices of the third parties listed in Section 6.1 once data has been
          transmitted to them in connection with a request. Data Subjects are encouraged to review
          the separately published privacy notices of Meta Platforms, Inc. and of any third party
          API provider named above for details of how each of them independently handles data.
        </p>
        <p>
          6.3. No Personal Data is disclosed to data brokers, advertising networks, or any recipient
          for the purpose of cross-context behavioral advertising.
        </p>

        <h2>7. International Data Transfers</h2>
        <p>
          Given the nature of the Service and its reliance on globally distributed infrastructure
          and third party providers, Personal Data described in this Policy may be transferred to,
          stored in, and processed in countries other than the country in which a Data Subject is
          located, including jurisdictions that may not offer a level of data protection equivalent
          to that of the Data Subject's home jurisdiction. Where such a transfer originates from the
          European Economic Area, the United Kingdom, or another jurisdiction that imposes
          restrictions on international transfers, the Controller relies on the derogations and
          safeguards made available under applicable law, including reliance on the receiving
          party's own compliance obligations where the transfer is to a recipient in a jurisdiction
          subject to an adequacy decision, or on standard contractual clauses or an equivalent
          transfer mechanism where offered by the receiving third party's own terms.
        </p>

        <h2>8. Data Retention</h2>
        <p>
          8.1. The Submitted URL and any media data retrieved in response to it are processed
          transiently, for the duration necessary to serve the request and stream the resulting
          file to the requesting user's browser. The Service does not maintain a persistent
          database of Submitted URLs or of downloaded media content following completion of a
          request.
        </p>
        <p>
          8.2. Automatically collected technical data described in Section 3.2 is retained only for
          as long as reasonably necessary for the security, diagnostic, and abuse prevention
          purposes described in Section 5, after which it is deleted or anonymized in the ordinary
          course of log rotation carried out by the underlying hosting infrastructure, absent a
          legal obligation or legitimate need to retain specific records for a longer period,
          including in connection with an ongoing investigation of suspected abuse or a legal
          claim.
        </p>

        <h2>9. Data Security</h2>
        <p>
          The Controller implements reasonable technical and organizational measures designed to
          protect Personal Data against unauthorized or unlawful Processing and against accidental
          loss, destruction, or damage, having regard to the nature of the data processed and the
          resources reasonably available to an individually operated service of this kind. These
          measures include the use of encrypted transport (HTTPS/TLS) for data in transit between a
          user's browser and the Service. No method of electronic transmission or storage is
          entirely secure, and the Controller cannot guarantee absolute security of any information
          transmitted to or through the Service.
        </p>

        <h2>10. Data Subject Rights</h2>
        <p>
          10.1. Where GDPR, UK GDPR, or an equivalent framework grants these rights to a Data
          Subject, and subject to the exceptions and limitations set out in that framework, a Data
          Subject may have the right to:
        </p>
        <ul>
          <li>Request confirmation of whether Personal Data concerning them is being processed,
            and to obtain access to that data (right of access, Article 15 GDPR).</li>
          <li>Request rectification of inaccurate or incomplete Personal Data (right to
            rectification, Article 16 GDPR).</li>
          <li>Request erasure of Personal Data in certain circumstances (right to erasure, Article
            17 GDPR).</li>
          <li>Request restriction of Processing in certain circumstances (Article 18 GDPR).</li>
          <li>Receive a copy of Personal Data provided to the Controller in a structured, commonly
            used, machine readable format, and to have that data transmitted to another controller
            where technically feasible (right to data portability, Article 20 GDPR).</li>
          <li>Object to Processing carried out on the basis of legitimate interests, on grounds
            relating to their particular situation (right to object, Article 21 GDPR).</li>
          <li>Lodge a complaint with a supervisory authority in their place of habitual residence,
            place of work, or place of the alleged infringement.</li>
        </ul>
        <p>
          10.2. Where CCPA grants these rights to a California resident, that resident may have the
          right to request that the Controller disclose the categories and specific pieces of
          Personal Data collected, the categories of sources from which it was collected, and the
          categories of third parties with whom it has been disclosed, to request deletion of
          Personal Data, and to be free from discrimination for exercising any of these rights.
          Because the Controller does not sell or share Personal Data as those terms are defined
          under CCPA, there is no applicable opt-out of sale or sharing to exercise.
        </p>
        <p>
          10.3. Because the Service does not operate an account system and does not retain a
          persistent, individually identifiable profile of Submitted URLs tied to a specific
          visitor, in most cases there is no stored personal record capable of being individually
          retrieved, corrected, or deleted beyond the short lived technical logs described in
          Section 8.2. Where a specific request under this Section 10 can be given effect, it may be
          submitted to <a href="mailto:developer@nyanpixel.my.id">developer@nyanpixel.my.id</a>, and
          it will be assessed and responded to within the timeframe required by applicable law.
        </p>

        <h2>11. Cookies and Similar Technologies</h2>
        <p>
          The Service does not, as of the date of this Policy, set first party tracking cookies, and
          does not embed third party advertising or analytics trackers on its pages. Any cookies
          strictly necessary for basic technical operation of the underlying hosting platform, if
          set at all, are limited to that function. Should a future version of the Service introduce
          analytics, functional cookies, or advertising technology, this Policy will be updated in
          advance of that change to describe the categories of cookies used, their purpose, and any
          consent or opt-out mechanism made available, consistent with applicable law, including the
          ePrivacy Directive as implemented in relevant member states, to the extent applicable.
        </p>

        <h2>12. Automated Decision-Making and Profiling</h2>
        <p>
          The Controller does not carry out solely automated decision-making, including profiling,
          that produces legal effects concerning a Data Subject or similarly significantly affects a
          Data Subject, within the meaning of Article 22 GDPR. The Service's core function, matching
          a Submitted URL to publicly available media, is a deterministic retrieval operation and
          does not involve evaluation of personal characteristics of the Data Subject submitting the
          request.
        </p>

        <h2>13. Children's Privacy</h2>
        <p>
          The Service is not directed at children, is not designed to appeal primarily to children,
          and is not knowingly used to collect Personal Data from a child below the applicable age
          threshold in the Data Subject's jurisdiction, including without limitation the threshold of
          13 years under the U.S. Children's Online Privacy Protection Act and 16 years, or the lower
          age permitted by member state law, under Article 8 GDPR. Where the Controller becomes aware
          that Personal Data has been collected from a child below the applicable threshold without
          the requisite parental or guardian consent, the Controller will take reasonable steps to
          delete that data upon notice sent to{' '}
          <a href="mailto:developer@nyanpixel.my.id">developer@nyanpixel.my.id</a>.
        </p>

        <h2>14. Data Breach Notification</h2>
        <p>
          In the event of a Personal Data breach that is likely to result in a risk to the rights and
          freedoms of affected Data Subjects, the Controller will take reasonable steps to assess and
          contain the breach, and, where required by applicable law, to notify the competent
          supervisory authority and affected Data Subjects without undue delay and in accordance with
          the timeframes prescribed by that law.
        </p>

        <h2>15. Contact and Exercising Your Rights</h2>
        <p>
          Requests to exercise any right described in this Policy, or any other question regarding
          the Processing of Personal Data in connection with this Service, may be directed to{' '}
          <a href="mailto:developer@nyanpixel.my.id">developer@nyanpixel.my.id</a>. The Controller
          will make reasonable efforts to verify the identity of the requester before acting on a
          request, to the extent proportionate to the sensitivity of the request, and will respond
          within the timeframe required by applicable law.
        </p>

        <h2>16. Changes to this Policy</h2>
        <p>
          This Policy may be amended from time to time to reflect changes in the Service, in the
          third parties it relies on, or in applicable law. Material changes will be reflected by
          revising the "last updated" date at the top of this page. Continued use of the Service
          following the publication of a revised Policy constitutes acceptance of that revision, to
          the extent permitted by applicable law.
        </p>

        <h2>17. Severability</h2>
        <p>
          If any provision of this Policy is held to be invalid or unenforceable under applicable
          law, that provision will be enforced to the maximum extent permissible, and the remaining
          provisions of this Policy will continue in full force and effect.
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
          max-width: 780px;
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
          font-size: 18px;
          margin: 34px 0 12px;
        }

        p {
          font-size: 14.5px;
          margin: 0 0 12px;
        }

        ul {
          padding-left: 20px;
          margin: 0 0 14px;
        }

        li {
          font-size: 14.5px;
          margin-bottom: 8px;
        }

        strong {
          font-weight: 600;
        }

        a {
          color: #2f3b58;
        }
      `}</style>
    </>
  );
}
