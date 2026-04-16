import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Shield, Feather, ArrowRight } from "lucide-react";

const Legal = () => {
  const { hash } = useLocation();
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      setActiveTab(id);
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
      title: "Our Manifesto",
      subtitle: "The vision behind Postify.",
      content: (
        <div className="space-y-8">
          <p className="text-xl md:text-2xl font-light leading-relaxed text-slate-800 tracking-tight">
            Postify is a sanctuary for modern expression. We designed this platform for sharing thoughts, ideas, and creativity without the noise of the typical algorithmic feeds. 
            Whether you’re here to express opinions, explore trending content, or engage in meaningful discussions — we connect people through authentic conversations.
          </p>
          <div className="pt-10">
            <div className="h-px w-full bg-slate-200 mb-10" />
            <h3 className="text-2xl font-medium text-slate-900 mb-6 font-serif">The Core Philosophy</h3>
            <p className="text-slate-600 font-light leading-relaxed mb-10 text-lg">
              Our mission is to make posting simple, safe, and intelligent — powered by AI moderation,
              personalized recommendations, and a welcoming global community. We are building a space where
              creativity breathes and engagement thrives naturally.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-12">
              <div className="group">
                <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center mb-5 group-hover:border-slate-800 transition-colors duration-500">
                  <Feather className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                </div>
                <h4 className="text-xl font-medium text-slate-900 mb-3">Authentic Voices</h4>
                <p className="text-slate-600 font-light leading-relaxed">Every feature is designed to amplify the true voice of our creators, giving ideas the space they need to resonate.</p>
              </div>
              <div className="group">
                <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center mb-5 group-hover:border-slate-800 transition-colors duration-500">
                  <Shield className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                </div>
                <h4 className="text-xl font-medium text-slate-900 mb-3">Safe Harbor</h4>
                <p className="text-slate-600 font-light leading-relaxed">Our industry-leading moderation ensures your experience is focused on connection, not conflict.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "privacy",
      title: "Privacy Posture",
      subtitle: "How we protect your digital footprint.",
      content: (
        <div className="space-y-8">
          <p className="text-xl md:text-2xl font-light leading-relaxed text-slate-800 tracking-tight">
            Your privacy matters profoundly to us. We collect only the minimal data necessary to deliver a secure
            and customized experience — such as your username, email, and the posts you choose to share.
          </p>
          <div className="bg-slate-50 p-8 md:p-12 mt-10 rounded-3xl border border-slate-100">
            <h3 className="text-xl text-slate-900 font-medium mb-6 font-serif">The Privacy Promise</h3>
            <ul className="space-y-5">
              {[
                "We never sell or share your data without your explicit consent.",
                "You maintain full rights to access, modify, or completely delete your information at any time.",
                "Rigorous encryption for all sensitive local states and credentials.",
                "A transparent data flow – you are always in control of what stays visible."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <ArrowRight className="w-3 h-3 text-slate-700" />
                  </div>
                  <span className="text-slate-700 font-light leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-slate-500 text-sm mt-8 border-l border-slate-300 pl-4">
            For specialized account or privacy inquiries, please contact our support team directly from your
            profile settings.
          </p>
        </div>
      ),
    },
    {
      id: "terms",
      title: "Terms of Service",
      subtitle: "The rules of engagement.",
      content: (
        <div className="space-y-8">
          <p className="text-xl md:text-2xl font-light leading-relaxed text-slate-800 tracking-tight">
            By using Postify, you agree to respect our community guidelines. We are committed to maintaining a safe, positive, and inspiring environment for all.
          </p>
          <div className="mt-12 space-y-12">
            <div className="relative pl-6 md:pl-10">
              <span className="absolute left-0 top-0 text-3xl font-serif text-slate-200 -z-10 select-none">01</span>
              <h3 className="text-xl font-medium text-slate-900 mb-3 pt-2">Respectful Conduct</h3>
              <p className="text-slate-600 font-light leading-relaxed">Users are strictly prohibited from posting harmful, illegal, or offensive material. Violations are addressed promptly and may result in the suspension or complete removal of your account footprint. We hold zero tolerance for hate speech, targeted harassment, or malicious content.</p>
            </div>
            <div className="relative pl-6 md:pl-10">
              <span className="absolute left-0 top-0 text-3xl font-serif text-slate-200 -z-10 select-none">02</span>
              <h3 className="text-xl font-medium text-slate-900 mb-3 pt-2">Liability Limitation</h3>
              <p className="text-slate-600 font-light leading-relaxed">While we moderate heavily, Postify acts as a platform for expression and is not legally liable for user-generated content or third-party actions. We ask every user to wield their platform presence responsibly and respectfully. All individual opinions expressed remain entirely autonomous.</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-slate-900 font-sans selection:bg-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col lg:flex-row gap-16 lg:gap-24 relative">
        
        {/* Sticky Sidebar Navigation */}
        <aside className="lg:w-1/3 flex-shrink-0">
          <div className="sticky top-32">
            <p className="text-slate-400 font-medium tracking-widest text-xs uppercase mb-4">Postify Directory</p>
            <h1 className="text-5xl lg:text-7xl font-serif tracking-tight mb-12 text-slate-900 leading-tight">
              About & <br /> Legal
            </h1>
            
            <nav className="flex flex-col gap-1">
              {sections.map(({ id, title }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                    window.history.pushState(null, "", `#${id}`);
                  }}
                  className={`text-left py-4 px-6 rounded-2xl transition-all duration-300 outline-none ${
                    activeTab === id 
                      ? "bg-slate-100 text-slate-900 font-medium" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">{title}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Scrolling Content Area */}
        <main className="lg:w-2/3 space-y-32">
          {sections.map(({ id, title, subtitle, content }) => (
            <section 
              key={id} 
              id={id} 
              className={`scroll-mt-32 transition-all duration-700 ease-in-out ${activeTab === id ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4 hover:opacity-60 cursor-pointer'}`}
              onMouseEnter={() => id !== activeTab && setActiveTab(id)}
              onClick={() => id !== activeTab && setActiveTab(id)}
            >
              <div className="mb-12 border-b border-slate-200 pb-8">
                <h2 className="text-4xl md:text-6xl font-serif tracking-tight mb-4 text-slate-900">
                  {title}
                </h2>
                <p className="text-slate-500 text-xl font-light tracking-wide">{subtitle}</p>
              </div>
              
              <div className="prose prose-slate prose-lg max-w-none">
                {content}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default Legal;
