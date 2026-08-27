import React from "react";

const linkStyle: React.CSSProperties = {
  color: "#FFFFFF",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

export default function PrivacyPolicy() {
  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px 20px 64px",
        fontFamily: "sans-serif",
        color: "#FFFFFF",
        lineHeight: 1.65,
      }}
    >
      <h1 style={{ fontFamily: "Georgia, serif", color: "#FFFFFF" }}>
        Privacy Policy
      </h1>
      <p>
        <strong>Effective and last updated: August 27, 2026</strong>
      </p>

      <p>
        This Privacy Policy explains how Pelvi Health, LLC (&quot;Pelvi Health,&quot;
        &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) handles information when you use the
        DiastaFix iOS mobile application (&quot;DiastaFix&quot;). DiastaFix does not
        require or create a separate DiastaFix account, and the app does not ask
        you to create an account with an email address.
      </p>

      <hr
        style={{
          border: 0,
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          margin: "24px 0",
        }}
      />

      <h2>1. Information DiastaFix Handles</h2>
      <p>Depending on the features you use, DiastaFix may handle:</p>
      <ul>
        <li>
          <strong>Profile and assessment information:</strong> information you
          choose to enter, such as your first name, age, postpartum timeline,
          symptoms, self-reported abdominal gap and tissue depth, navel or hernia
          history, goals, and other plan-personalization answers.
        </li>
        <li>
          <strong>Recovery and activity information:</strong> completed program
          days, videos watched, exercise activity, streaks, habits, water logs,
          period and cycle entries, C-section education progress, measurements,
          notes, and saved exercises.
        </li>
        <li>
          <strong>Content you provide:</strong> optional progress photos and the
          questions, messages, and conversation history you use with Coach Mia.
        </li>
        <li>
          <strong>Subscription information:</strong> product, entitlement,
          purchase, trial, renewal, cancellation, refund, transaction, price, and
          currency information associated with an App Store subscription. We do
          not receive your full payment-card details.
        </li>
        <li>
          <strong>Technical and interaction information:</strong> device and app
          version, operating system, language, general region inferred from an IP
          address, app launches, navigation and feature interactions, performance
          and diagnostic information, and advertising or attribution identifiers
          when permitted.
        </li>
      </ul>

      <h2>2. How We Use Information</h2>
      <p>We use this information to:</p>
      <ul>
        <li>personalize and operate your DiastaFix program;</li>
        <li>save and sync your progress across your Apple devices;</li>
        <li>provide Coach Mia responses and other requested features;</li>
        <li>manage subscription access, purchases, restores, and support;</li>
        <li>understand app performance and improve navigation and features; and</li>
        <li>
          measure advertising and subscription conversions as described below.
        </li>
      </ul>

      <h2>3. On-Device Storage and Private iCloud Sync</h2>
      <p>
        Much of your information is stored on your device. If iCloud is enabled
        for DiastaFix, profile details, assessment answers, program progress,
        workouts, measurements, optional photos, Coach Mia conversation history,
        cycle entries, water logs, and related app data may sync through Apple
        CloudKit or iCloud key-value storage in the private iCloud account
        associated with your Apple Account. Apple controls the iCloud service and
        its security. Pelvi Health does not receive a browsable copy of your
        private CloudKit database merely because iCloud sync is enabled.
      </p>

      <h2>4. Coach Mia and Firebase</h2>
      <p>
        When you use Coach Mia, DiastaFix sends the question you ask, recent
        conversation context, and relevant profile or recovery context to
        Firebase services operated by Google so a response can be generated.
        This context can include sensitive information such as self-reported
        symptoms, measurements, postpartum timeline, hernia or risk flags, and
        current program status. Your Coach Mia conversation history may also be
        stored on your device and in your private iCloud data as described above.
      </p>
      <p>
        Coach Mia information is used to provide the feature. We do not send Coach
        Mia questions, answers, health context, measurements, photos, cycle data,
        or other health information to Meta for advertising.
      </p>

      <h2>5. Analytics with Microsoft Clarity</h2>
      <p>
        We use Microsoft Clarity to understand app navigation, interactions,
        errors, and performance. Our required Clarity configuration uses strict
        masking so on-screen text and images are obscured in session replay. We
        do not intentionally attach names, assessment answers, measurements,
        cycle entries, photos, Coach Mia text, or other health details to Clarity
        screen names, custom identifiers, or event parameters.
      </p>
      <p>
        Clarity may still process technical and product-interaction information,
        such as device and operating-system details, app screens identified by
        generic names, taps or navigation patterns, session identifiers,
        performance information, and a general location inferred from an IP
        address.
      </p>

      <h2>6. Purchases and RevenueCat</h2>
      <p>
        Subscriptions are purchased through Apple In-App Purchase. Apple processes
        payment credentials and billing. We use RevenueCat to validate purchases,
        manage subscription entitlements, restore access, analyze subscription
        performance, and support advertising attribution. RevenueCat may receive
        an automatically generated app-user identifier, Apple transaction and
        subscription information, product, price and currency, device and app
        information, and Apple Ads attribution information.
      </p>

      <h2>7. Meta Advertising, Conversion Measurement, and ATT</h2>
      <p>
        DiastaFix sends Meta only a limited set of parameter-free lifecycle events,
        such as app activation, onboarding started or completed, paywall viewed,
        and subscribe button tapped. These lifecycle events do not contain your
        name, assessment answers, measurements, symptoms, cycle information,
        photos, Coach Mia content, screen content, workout content, or other health
        information.
      </p>
      <p>
        Apple&apos;s App Tracking Transparency (ATT) prompt controls user-level Meta
        advertising attribution. Only if you authorize tracking may DiastaFix
        collect or forward advertising and Meta attribution identifiers through
        RevenueCat, and only then may RevenueCat report subscription conversion
        events to Meta, such as a trial or subscription starting, renewing,
        canceling, or refunding, together with product, amount, and currency.
        Health and wellness information is never included in those conversion
        events.
      </p>
      <p>
        If you deny or restrict ATT permission, DiastaFix does not collect or
        forward advertising identifiers through RevenueCat for user-level Meta
        subscription matching. Apple, Meta, or other platforms may still provide
        privacy-preserving aggregated campaign measurement that does not use the
        app to identify you across other companies&apos; apps and websites. You can
        review or change ATT permission in iOS Settings under Privacy &amp;
        Security &gt; Tracking.
      </p>

      <h2>8. Our Service Providers</h2>
      <p>We use the following providers for the purposes described above:</p>
      <ul>
        <li>
          <a href="https://www.apple.com/legal/privacy/" style={linkStyle}>
            Apple
          </a>{" "}
          for App Store purchases, iCloud, CloudKit, and Apple Ads attribution;
        </li>
        <li>
          <a href="https://www.revenuecat.com/privacy/" style={linkStyle}>
            RevenueCat
          </a>{" "}
          for subscription management and attribution;
        </li>
        <li>
          <a href="https://policies.google.com/privacy" style={linkStyle}>
            Google / Firebase
          </a>{" "}
          for Coach Mia processing and remote app services;
        </li>
        <li>
          <a
            href="https://privacy.microsoft.com/privacystatement"
            style={linkStyle}
          >
            Microsoft
          </a>{" "}
          for Clarity analytics; and
        </li>
        <li>
          <a href="https://www.facebook.com/privacy/policy/" style={linkStyle}>
            Meta
          </a>{" "}
          for limited app-event and authorized advertising measurement.
        </li>
      </ul>
      <p>
        These providers process information under their own terms, privacy
        policies, and retention practices. Information may be processed in the
        United States or other countries where they operate.
      </p>

      <h2>9. No Sale of Personal or Health Information</h2>
      <p>
        We do not sell personal information. We do not provide health or wellness
        information to data brokers or advertisers, and we do not use your health
        information for targeted advertising. If you authorize ATT, the limited
        advertising identifiers and subscription conversion information described
        in Section 7 may be considered &quot;sharing&quot; for cross-context behavioral
        advertising under some privacy laws. You can stop future user-level
        attribution by disabling DiastaFix under iOS Settings &gt; Privacy &amp;
        Security &gt; Tracking.
      </p>

      <h2>10. Retention and Deletion</h2>
      <p>
        On-device and private iCloud data generally remain until you delete them.
        Deleting DiastaFix removes its local copy from that device, but it does not
        necessarily delete data already stored in your private iCloud account.
      </p>
      <p>To remove DiastaFix data:</p>
      <ol>
        <li>Delete the DiastaFix app to remove the local app data from that device.</li>
        <li>
          To remove the private iCloud copy, open iOS Settings, select your Apple
          Account, choose iCloud, then Manage Account Storage (sometimes shown as
          Manage Storage), select DiastaFix, and choose Delete Data. Apple may
          change these menu labels between iOS versions.
        </li>
        <li>
          For help with information processed by Pelvi Health or its service
          providers, email{" "}
          <a href="mailto:support@diastafix.com" style={linkStyle}>
            support@diastafix.com
          </a>
          . Because DiastaFix does not create an account, we may ask for limited
          device, transaction, or subscription information needed to locate a
          vendor record. Please do not email health details or progress photos.
        </li>
      </ol>
      <p>
        Service providers may retain limited transaction, security, support, or
        compliance records for the periods required by their policies or by law.
        Apple controls App Store transaction records and private iCloud data.
      </p>

      <h2>11. Canceling a Subscription</h2>
      <p>
        Deleting the app or app data does not cancel a subscription. Manage or
        cancel your subscription in iOS Settings &gt; Apple Account &gt;
        Subscriptions, or in the App Store by opening your profile and selecting
        Subscriptions. Apple controls billing and cancellation.
      </p>

      <h2>12. Security</h2>
      <p>
        We use reasonable administrative and technical safeguards designed to
        protect information. No storage or transmission system is completely
        secure, so we cannot guarantee absolute security.
      </p>

      <h2>13. Your Choices and Rights</h2>
      <p>
        Depending on where you live, you may have rights to request access,
        correction, deletion, restriction, or information about how personal
        information is handled. Contact us to exercise a right. We may need to
        verify a request and may be unable to access information stored only on
        your device or in your private iCloud account.
      </p>

      <h2>14. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy as DiastaFix or applicable requirements
        change. We will update the date at the top when we make changes and provide
        any additional notice required by law.
      </p>

      <h2>15. Contact</h2>
      <p>
        For privacy questions or requests, email{" "}
        <a href="mailto:support@diastafix.com" style={linkStyle}>
          support@diastafix.com
        </a>
        .
      </p>
    </main>
  );
}
