import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Shield, Info, ScrollText } from "lucide-react";

const Legal = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hash]);

  const sections = [
    {
      id: "about",
      icon: Info,
      title: "About Postify",
      content: (
        <>
          <p className="text-gray-600 leading-relaxed mb-4">
            Postify is a modern platform designed for sharing thoughts, ideas, and creativity.
            Whether you’re here to express opinions, explore trending content, or engage in
            meaningful discussions — Postify connects people through authentic conversations.
          </p>
          <p className="text-gray-600">
            Our mission is to make posting simple, safe, and intelligent — powered by AI moderation,
            personalized recommendations, and a welcoming global community.
          </p>
        </>
      ),
    },
    {
      id: "privacy",
      icon: Shield,
      title: "Privacy Policy",
      content: (
        <>
          <p className="text-gray-600 leading-relaxed mb-4">
            Your privacy matters to us. We collect only minimal data necessary to deliver a secure
            and customized experience — such as your username, email, and posts you create.
          </p>
          <p className="text-gray-600 mb-4">
            We never sell or share your data without your consent. You have full rights to access,
            modify, or delete your information anytime.
          </p>
          <p className="text-gray-600">
            For account or privacy inquiries, please contact our support team directly from your
            profile page.
          </p>
        </>
      ),
    },
    {
      id: "terms",
      icon: ScrollText,
      title: "Terms of Service",
      content: (
        <>
          <p className="text-gray-600 leading-relaxed mb-4">
            By using Postify, you agree to respect our community guidelines and content policies.
            We aim to keep this a safe, positive environment for all.
          </p>
          <p className="text-gray-600 mb-4">
            Users are prohibited from posting harmful, illegal, or offensive material. Violations
            may result in suspension or removal of your account.
          </p>
          <p className="text-gray-600">
            Postify is not liable for user-generated content or third-party actions. Please use the
            platform responsibly and respectfully.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row px-6 py-10">
      

      <main className="flex-1 max-w-3xl mx-auto space-y-16">
        {sections.map(({ id, icon: Icon, title, content }) => (
          <section key={id} id={id} className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-4">
              <Icon className="text-blue-600 w-6 h-6" />
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition">
              {content}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default Legal;
