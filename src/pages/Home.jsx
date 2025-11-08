import { PenTool, Users, Zap, Shield, ArrowRight, Star } from "lucide-react";
import heroImage from "../assets/hero-image.jpg";


const Home = () => {
  const features = [
    {
      icon: PenTool,
      title: "Beautiful Writing Experience",
      description:
        "Craft your thoughts with our elegant, distraction-free editor designed for writers.",
    },
    {
      icon: Users,
      title: "Growing Community",
      description:
        "Connect with fellow writers and readers in a supportive, engaging environment.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Optimized for speed with instant publishing and seamless reading experience.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your content is protected with enterprise-grade security and privacy controls.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Tech Writer",
      content:
        "Postify has transformed how I share my ideas. The community here is incredible.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Content Creator",
      content:
        "Finally, a platform that puts writers first. Clean, fast, and beautifully designed.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Journalist",
      content:
        "The writing experience is unmatched. I've never been more productive.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Where Stories{" "}
              <span className="text-blue-600">Come to Life</span>
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of writers sharing their passion, expertise, and
              creativity on Postify, the most elegant blogging platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/signup"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Start Writing Today
                <ArrowRight className="h-5 w-5" />
              </a>
              
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current text-yellow-500" />
                ))}
                <span>5.0 from writers</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">10k+</span>{" "}
                stories published
              </div>
            </div>
          </div>
          <div className="relative group">
            <img
              src={heroImage}
              alt="Writing workspace"
              className="rounded-2xl shadow-2xl transition transform group-hover:scale-105 group-hover:rotate-1"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Built for <span className="text-blue-600">Modern Writers</span>
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              Everything you need to create, share, and grow your audience in
              one beautiful platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1"
              >
                <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-50 mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-gray-600 text-sm mt-2">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Loved by <span className="text-blue-600">Writers Everywhere</span>
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              See what our community has to say about their experience.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-500" />
                  ))}
                </div>
                <p className="italic text-gray-600">"{t.content}"</p>
                <div className="mt-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;