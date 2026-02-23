import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, BookOpen, Zap, ArrowRight, GraduationCap, MapPin, Calendar, Church } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-foreground">BBUC</span>
              <p className="text-xs text-muted-foreground">Bishop Barham University College</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="accent" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="min-h-[90vh] flex items-center pt-20 relative overflow-hidden"
        style={{
          backgroundImage: "url('/ucu-campus.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#1a3a6b]/80"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 mb-8">
              <Church className="w-4 h-4 text-accent" />
              <span className="text-sm text-primary-foreground/90">"God the Beginning and the End"</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6 text-balance">
              Bishop Barham
              <span className="block text-accent">University College</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              Student Information Chatbot System
            </p>
            <p className="text-base text-primary-foreground/70 mb-10 max-w-xl mx-auto">
              Get instant answers about admissions, programs, campus life, and more. Your 24/7 academic assistant at UCU's first constituent college.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="accent" size="xl">
                  Start Chatting Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="hero-outline" size="xl">
                  Student Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">About BBUC</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                A Legacy of Faith & Excellence Since 1924
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Bishop Barham University College, a constituent college of Uganda Christian University, stands at the cradle of the East African Revival movement. Located in Kabale, Southwestern Uganda, we serve students from across the region including Rwanda and Burundi.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span className="text-sm text-foreground">Kabale, Uganda</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span className="text-sm text-foreground">Est. 1924</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "100+", label: "Years of Heritage" },
                { value: "6", label: "Academic Departments" },
                { value: "3", label: "Master's Programs" },
                { value: "24/7", label: "Chatbot Support" }
              ].map((stat, index) => (
                <div key={index} className="bg-card rounded-2xl p-6 shadow-card text-center">
                  <div className="font-display text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Chatbot Features</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              Your Academic Assistant
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get instant help with admissions, course registration, campus services, and more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: "Instant Answers",
                description: "Get immediate responses to your questions about programs, admissions, fees, and campus life at BBUC."
              },
              {
                icon: BookOpen,
                title: "Academic Guidance",
                description: "Explore our departments: Social Sciences, Business, Education, Theology, Journalism, and Environmental Science."
              },
              {
                icon: Users,
                title: "Personal Dashboard",
                description: "Track your conversations, save important information, and manage your queries all in one place."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-card rounded-2xl p-8 shadow-card card-hover border border-border"
              >
                <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-accent-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Departments</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              Academic Programs
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Social Sciences",
              "Business & Administration",
              "Education",
              "Theology & Divinity",
              "Journalism & Media",
              "Environmental Science"
            ].map((dept, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-5 shadow-card border border-border hover:border-accent/50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-medium text-foreground">{dept}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <Church className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            Join our student information system and get instant answers to all your questions about Bishop Barham University College.
          </p>
          <Link to="/signup">
            <Button variant="accent" size="xl">
              Create Your Account
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-foreground">BBUC</span>
                <p className="text-xs text-muted-foreground">Uganda Christian University</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>P.O. Box 613, Kabale, Uganda</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Bishop Barham University College
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
