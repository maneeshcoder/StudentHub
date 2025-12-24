import { useState, useEffect } from 'react';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Heart, 
  Award, 
  GraduationCap, 
  Users,
  Target,
  Zap
} from 'lucide-react';

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Priyanshu Goswami",
      college: "BHU",
      role: "Btech Student",
      content: "EduSphere completely transformed my learning experience. The team finder helped me build an amazing project group that won our hackathon. The notes sharing feature saved me during finals!",
      rating: 5,
      avatarColor: "from-blue-500 to-cyan-500",
      icon: <Zap className="w-6 h-6" />,
      stat: "Found 3 project teams"
    },
    {
      id: 2,
      name: "Aman Sawarliya",
      college: "Graphic Era",
      role: "Btech Student",
      content: "As a btech student, finding community was tough. EduSphere's anonymous chat let me ask questions without hesitation, and I made lifelong friends through the college communities.",
      rating: 5,
      avatarColor: "from-purple-500 to-pink-500",
      icon: <Users className="w-6 h-6" />,
      stat: "Joined 5 communities"
    },
    {
      id: 3,
      name: "Sneha Joshi",
      college: "AKIT",
      role: "Btech Student",
      content: "The events section helped me discover incredible hackathons and workshops. Through one networking event, I met my co-founder and we just secured our first round of funding!",
      rating: 5,
      avatarColor: "from-green-500 to-emerald-500",
      icon: <Target className="w-6 h-6" />,
      stat: "Attended 12 events"
    },
    {
      id: 4,
      name: "Priya Sharma",
      college: "UPES",
      role: "Btech Studentr",
      content: "The smart notes feature with AI summarization saved me hundreds of hours. Sharing notes with peers across different colleges gave me perspectives I couldn't find anywhere else.",
      rating: 5,
      avatarColor: "from-orange-500 to-amber-500",
      icon: <GraduationCap className="w-6 h-6" />,
      stat: "Shared 47 notes"
    },
    {
      id: 5,
      name: "Siddarth Singh",
      college: "IIT Rorkee",
      role: "Btech Student",
      content: "The anonymous feedback system helped me overcome imposter syndrome. Seeing others share similar struggles made me realize I wasn't alone. This platform is more than tech—it's a support system.",
      rating: 5,
      avatarColor: "from-red-500 to-rose-500",
      icon: <Heart className="w-6 h-6" />,
      stat: "100+ connections made"
    },
    {
      id: 6,
      name: "Mayank Pandey",
      college: "LPU",
      role: "Medical Student",
      content: "Balancing med school with research was overwhelming. EduSphere helped me find study groups, share resources, and connect with mentors. It's become my academic lifeline.",
      rating: 5,
      avatarColor: "from-indigo-500 to-blue-500",
      icon: <Award className="w-6 h-6" />,
      stat: "4.0 GPA achieved"
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Students", icon: <Users className="w-5 h-5" /> },
    { value: "4.9", label: "Average Rating", icon: <Star className="w-5 h-5 fill-current" /> },
    { value: "500+", label: "Colleges", icon: <GraduationCap className="w-5 h-5" /> },
    { value: "98%", label: "Satisfaction", icon: <Heart className="w-5 h-5 fill-current" /> },
  ];

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    setAutoplay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setAutoplay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoplay(false);
  };

  return (
    <div className="relative py-20 px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Trusted by Students Worldwide</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Loved by Students
            </span>
            <br />
            <span className="text-white">From Top Universities</span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join thousands of students who are transforming their academic journey with EduSphere
          </p>
        </div>

        

        {/* Testimonials Carousel */}
        <div className="relative mb-12">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-700/50 text-gray-300 hover:text-white hover:border-blue-500/50 transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-700/50 text-gray-300 hover:text-white hover:border-blue-500/50 transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Testimonials Container */}
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-3xl border border-gray-800/50 p-8 md:p-12">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Left Side - User Info */}
                      <div className="lg:w-1/3">
                        <div className="flex items-center gap-6 mb-8">
                          <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full blur-md opacity-50"></div>
                            <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${testimonial.avatarColor} flex items-center justify-center text-white text-2xl font-bold`}>
                              {testimonial.name.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{testimonial.name}</h3>
                            <p className="text-sm text-gray-300">{testimonial.college}</p>
                            <p className="text-xs text-gray-500">{testimonial.role}</p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-sm text-gray-400 ml-2">5.0</span>
                        </div>

                        {/* Achievement Stat */}
                        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${testimonial.avatarColor}`}>
                              <div className="text-white">
                                {testimonial.icon}
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-300">Achievement</span>
                          </div>
                          <p className="text-lg font-bold text-white">{testimonial.stat}</p>
                        </div>
                      </div>

                      {/* Right Side - Testimonial Content */}
                      <div className="lg:w-2/3">
                        <div className="relative">
                          {/* Quote Icon */}
                          <div className="absolute -top-4 -left-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                              <Quote className="w-6 h-6 text-blue-400" />
                            </div>
                          </div>

                          {/* Testimonial Text */}
                          <blockquote className="text-xl text-gray-300 leading-relaxed pl-12 pt-4 mb-8">
                            "{testimonial.content}"
                          </blockquote>

                          {/* Verified Badge */}
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Verified Student • {testimonial.college.split(' ')[0]} Alumni</span>
                          </div>
                        </div>

                        {/* University Badge */}
                        <div className="mt-8 pt-8 border-t border-gray-800/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg">
                                <GraduationCap className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">Top University Verified</p>
                                <p className="text-xs text-gray-500">Profile validated through university email</p>
                              </div>
                            </div>
                            <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                              Verified ✓
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 mb-16">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 w-8'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* University Logos/Grid */}
        <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm rounded-3xl border border-gray-800/50 p-8">
          <h3 className="text-center text-xl font-bold text-white mb-8">
            Trusted by Students from
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: "AKIT", color: "from-red-500 to-pink-500", short: "MIT" },
              { name: "LPU", color: "from-red-600 to-crimson-600", short: "HARVARD" },
              { name: "UPES", color: "from-red-500 to-amber-500", short: "STANFORD" },
              { name: "BHU", color: "from-blue-500 to-cyan-500", short: "UCB" },
              { name: "IIT", color: "from-gray-700 to-gray-900", short: "CMU" },
              { name: "NIT", color: "from-blue-600 to-blue-800", short: "UMICH" },
            ].map((uni, index) => (
              <div
                key={index}
                className="group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 text-center hover:border-blue-500/30 transition-all duration-300"
              >
                <div className={`inline-flex p-3 ${uni.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{uni.short}</h4>
                <p className="text-xs text-gray-400">{uni.name}</p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>

       
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .crimson-600 {
          background-color: #dc143c;
        }
      `}</style>
    </div>
  );
}