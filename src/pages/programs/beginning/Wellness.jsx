import { MainLayout } from '@/components/layout/MainLayout';
import { memo, useCallback, useState } from 'react';

// SVG Icon Components
const Activity = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const Brain = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

const Calendar = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const Heart = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const Leaf = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

const Moon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const Shield = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const Sun = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

// Memoized components for better performance
const BenefitCard = memo(({ icon, title, description }) => (
  <div
    className="group bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-2xl
                  transition-all duration-300 border border-gray-100
                  hover:border-green-200 transform hover:-translate-y-1"
  >
    <div className="flex items-start gap-4">
      <div
        className="flex-shrink-0 text-green-600 bg-gradient-to-br from-green-50 to-green-100
                      p-3 rounded-xl group-hover:scale-110 transition-transform duration-300
                      shadow-sm group-hover:shadow-md group-hover:shadow-green-500/20"
      >
        {icon}
      </div>
      <div>
        <h3
          className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700
                       transition-colors duration-300"
        >
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
));

BenefitCard.displayName = 'BenefitCard';

const TestimonialCard = memo(({ quote, name, role, image }) => (
  <div
    className="group bg-gradient-to-br from-green-50/50 to-white p-6 rounded-2xl
                  shadow-md hover:shadow-xl transition-all duration-300
                  border border-green-100 hover:border-green-300
                  transform hover:-translate-y-1"
  >
    <div className="flex flex-col items-center mb-4">
      <div className="relative mb-3">
        <div
          className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-0
                        group-hover:opacity-30 transition-opacity duration-300"
        />
        <img
          src={image}
          alt={name}
          className="relative w-20 h-20 rounded-full object-cover border-4 border-green-200
                     group-hover:border-green-400 transition-all duration-300"
          loading="lazy"
        />
      </div>
      <div className="text-center">
        <p
          className="font-bold text-gray-900 group-hover:text-green-700
                      transition-colors duration-300"
        >
          {name}
        </p>
        {role && <p className="text-sm text-gray-600 mt-1">{role}</p>}
      </div>
    </div>
    <div className="text-green-600 text-3xl mb-2 text-center font-serif">"</div>
    <p className="text-gray-700 text-base sm:text-lg italic leading-relaxed text-center">{quote}</p>
  </div>
));

TestimonialCard.displayName = 'TestimonialCard';

const FAQItem = memo(({ faq, index, isOpen, onToggle }) => (
  <div
    className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300
                  overflow-hidden border border-gray-100 hover:border-green-200"
  >
    <button
      onClick={onToggle}
      className="w-full px-6 sm:px-8 py-6 flex justify-between items-start text-left
                 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-white
                 transition-all group"
      aria-expanded={isOpen}
      aria-controls={`faq-answer-${index}`}
    >
      <div className="flex items-start gap-4 flex-1">
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                        transition-all duration-300 ${
                          isOpen
                            ? 'bg-green-600 text-white scale-110'
                            : 'bg-green-100 text-green-600 group-hover:bg-green-200 group-hover:scale-105'
                        }`}
        >
          <span className="text-sm font-bold">Q</span>
        </div>
        <span
          className="font-semibold text-gray-900 pr-4 text-base sm:text-lg
                       leading-relaxed pt-1 group-hover:text-green-700
                       transition-colors duration-300"
        >
          {faq.question}
        </span>
      </div>
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                      transition-all duration-300 ${
                        isOpen
                          ? 'bg-green-600 rotate-180 scale-110'
                          : 'bg-gray-100 group-hover:bg-green-100 group-hover:scale-105'
                      }`}
      >
        <ChevronDown
          className={`w-5 h-5 transition-colors duration-300 ${
            isOpen ? 'text-white' : 'text-green-600'
          }`}
        />
      </div>
    </button>

    <div
      id={`faq-answer-${index}`}
      className={`transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
      style={{ overflow: 'hidden' }}
    >
      <div className="px-6 sm:px-8 pb-6 pt-2">
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100
                          flex items-center justify-center"
          >
            <span className="text-sm font-bold text-amber-600">A</span>
          </div>
          <p className="text-gray-700 leading-relaxed text-base sm:text-lg pt-1 flex-1">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  </div>
));

FAQItem.displayName = 'FAQItem';

const PillBadge = memo(({ icon: Icon, text }) => (
  <div
    className="group flex items-center bg-white/15 backdrop-blur-md px-5 py-3
                  rounded-full border border-white/20 hover:bg-white/25
                  hover:border-white/30 transition-all duration-300
                  hover:scale-105 cursor-default"
  >
    <Icon
      className="w-5 h-5 mr-2 text-green-300 group-hover:scale-110
                     transition-transform duration-300"
    />
    <span className="text-white font-medium">{text}</span>
  </div>
));

PillBadge.displayName = 'PillBadge';

export default function WellnessProgram() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const benefits = [
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'Lose weight, boost immunity and avoid deficiencies',
      description:
        'Lifestyle changes and practical dietary tips to lose weight without compromising on health and nutrition.',
    },
    {
      icon: <Moon className="w-8 h-8" />,
      title: 'Manage sleep deprivation & stress',
      description:
        'Learn to stay rejuvenated and stress-free with yoga, meditation and some practical tips.',
    },
    {
      icon: <Sun className="w-8 h-8" />,
      title: 'The perfect routine',
      description:
        'Customize the best lifestyle for you subject to the needs of your body, your time and your convenience.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Keep lifestyle diseases at bay',
      description:
        'Incorporate lifestyle changes that help you prevent diseases like diabetes, heart disease, digestive issues, etc.',
    },
  ];

  const testimonials = [
    {
      quote: 'This course should be a part of...',
      name: 'Dr. Soumya Rao',
      role: '',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&q=80',
    },
    {
      quote: 'My biggest takeaway – Being healthy and...',
      name: 'Shilpa',
      role: 'Consultant Architect',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80',
    },
    {
      quote: 'Covers everything from our thought processes, attitudes...',
      name: 'Anuradha',
      role: 'Homemaker',
      image:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&q=80',
    },
    {
      quote: 'Learn about dincharya-what to do when.',
      name: 'Kumar Simha',
      role: 'MC, Anchor, Trainer',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80',
    },
    {
      quote: 'In four days, the body is feeling...',
      name: 'Manish',
      role: 'Senior Principal, Software Architect, Infosys',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80',
    },
  ];

  const faqs = [
    {
      question: 'What is the duration of the program? Can I find suitable timings?',
      answer:
        'It is a 12.5 - hour program (5-days, 2.5 hours/day). You can easily find programs with timings of your convenience.',
    },
    {
      question:
        'Can the program help me if I am already suffering from a non communicable disease like diabetes, hypertension etc?',
      answer:
        'Yes! The program helps you customize a wellness roadmap for yourself. In addition to your ongoing treatment, the right lifestyle changes will improve your condition.',
    },
    {
      question: 'What does the program consist of?',
      answer:
        'Educational modules on nutrition, sleep, āyurveda, exercise, and deeply relaxing yoga, meditation sessions and women issues.',
    },
    {
      question: 'What is The Art of Living and how is it associated with the program?',
      answer:
        'The Art of Living is one of the largest volunteer-based organizations working towards a stress-free, violence-free, and healthy society through a range of programs. The Wellness Program is one of its programs offering stress-relief.',
    },
    {
      question: 'Is there shuttle services available in Ashram?',
      answer: 'Yes, we have 24/7 shuttle service available in Art of Living International Ashram.',
    },
    {
      question: 'What are various amenities available in Art of Living International Centre',
      answer:
        'We offer round-the-clock internet and Wi-Fi access, accompanied by cafes, eateries, and restaurants serving healthy and hygienic meals. Furthermore, our establishment features stores providing groceries, jewelry, clothing, and other amenities.',
    },
  ];

  const toggleFaq = useCallback(index => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-green-50">
        {/* Hero Section */}
        <section
          className="relative py-20 sm:py-28 lg:py-36 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80)',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto">
              {/* Badge */}
              <div
                className="inline-flex items-center bg-white/20 backdrop-blur-md px-5 py-2
                            rounded-full mb-6 border border-white/30
                            hover:bg-white/30 transition-all duration-300"
              >
                <Leaf className="w-4 h-4 text-white mr-2" />
                <span className="text-white text-sm font-medium">Art of Living Wellness</span>
              </div>

              {/* Main Heading */}
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6
                           leading-tight tracking-tight"
              >
                Wellness Program
              </h1>

              {/* Subtitle */}
              <p
                className="text-xl sm:text-2xl lg:text-3xl text-white/95 mb-8 max-w-4xl
                          mx-auto leading-relaxed font-light"
              >
                A complete wellness guide with an integrative approach based on{' '}
                <span className="font-semibold text-green-300">Ayurveda</span> &{' '}
                <span className="font-semibold text-green-300">modern science</span>
              </p>

              {/* Benefits Pills */}
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mb-10">
                <PillBadge icon={Heart} text="Stay healthy" />
                <PillBadge icon={Shield} text="Keep lifestyle illnesses at bay" />
                <PillBadge icon={Brain} text="Live stress-free" />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <a
                  href="https://programs.vvmvp.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-2 px-8 py-3.5 sm:px-10 sm:py-4
                           bg-gradient-to-r from-green-600 to-emerald-600
                           hover:from-green-700 hover:to-emerald-700
                           text-white font-semibold text-base sm:text-lg
                           rounded-full shadow-lg hover:shadow-2xl hover:shadow-green-500/30
                           transition-all duration-300 ease-out
                           transform hover:scale-[1.02] active:scale-[0.98]
                           focus:outline-none focus:ring-4 focus:ring-green-500/50
                           overflow-hidden"
                  aria-label="Register for wellness programs"
                >
                  <span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                                 -translate-x-full group-hover:translate-x-full
                                 transition-transform duration-1000 ease-in-out"
                    aria-hidden="true"
                  />
                  <span className="relative z-10">Register Now</span>
                  <svg
                    className="relative z-10 w-5 h-5 transition-transform duration-300
                                group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </a>

                <button
                  type="button"
                  className="group relative inline-flex items-center justify-center
                           px-8 py-3.5 sm:px-10 sm:py-4
                           bg-green-600/90 hover:bg-green-700/95 backdrop-blur-md
                           text-white font-semibold text-base sm:text-lg rounded-full
                           border-2 border-white/30 hover:border-white/50
                           shadow-xl hover:shadow-2xl hover:shadow-green-500/30
                           transition-all duration-300 ease-out
                           transform hover:scale-[1.03] active:scale-[0.97]
                           focus:outline-none focus:ring-4 focus:ring-white/40
                           focus:ring-offset-2 focus:ring-offset-transparent
                           overflow-hidden min-w-[200px]"
                  aria-label="Start health improvement journey"
                >
                  <span
                    className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-white/10 to-green-500/0
                                 opacity-0 group-hover:opacity-100
                                 transition-opacity duration-500"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute inset-0 rounded-full bg-white/20
                                 scale-0 group-hover:scale-100 group-hover:opacity-0
                                 transition-all duration-700 ease-out"
                    aria-hidden="true"
                  />
                  <Heart
                    className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3
                                  transition-transform duration-300 group-hover:scale-110
                                  group-hover:rotate-12"
                  />
                  <span className="relative z-10 tracking-wide">I want to improve my health</span>
                  <svg
                    className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3
                                opacity-0 group-hover:opacity-100
                                transition-all duration-500 group-hover:rotate-180"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              </div>

              {/* Duration */}
              <div
                className="inline-flex items-center bg-amber-500/20 backdrop-blur-md px-6 py-3
                            rounded-full border border-amber-300/30 hover:bg-amber-500/30
                            transition-all duration-300"
              >
                <Calendar className="w-5 h-5 mr-2 text-amber-200" />
                <span className="text-white font-medium text-lg">
                  2 to 5-day residential format
                </span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
        </section>

        {/* The Wellness Secret Section */}
        <section
          className="py-20 sm:py-24 bg-gradient-to-br from-white via-green-50/30 to-white
                          relative overflow-hidden"
        >
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full
                        blur-3xl opacity-20"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100 rounded-full
                        blur-3xl opacity-20"
            aria-hidden="true"
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <div
                className="inline-block bg-green-100 text-green-700 px-6 py-2 rounded-full
                            text-sm font-semibold mb-4 hover:bg-green-200
                            transition-colors duration-300"
              >
                Ancient Wisdom Meets Modern Science
              </div>
              <h2
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6
                           tracking-tight"
              >
                The Wellness Secret
              </h2>
            </div>

            <div className="space-y-6 text-lg sm:text-xl leading-relaxed">
              <div
                className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border-l-4
                            border-green-600 hover:shadow-2xl transition-all duration-300
                            hover:border-l-8"
              >
                <p className="text-gray-700">
                  Did you know that{' '}
                  <span className="font-semibold text-green-700">
                    digestive issues, heart disease, diabetes, and most lifestyle diseases are
                    preventable?
                  </span>
                </p>
              </div>

              <div
                className="bg-gradient-to-br from-green-50 to-white p-8 sm:p-10 rounded-2xl
                            shadow-lg border border-green-200 hover:shadow-2xl
                            transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full
                                flex items-center justify-center text-black font-bold text-xl
                                shadow-lg hover:scale-110 transition-transform duration-300"
                  >
                    1
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-800 mb-3">Here is a secret:</h3>
                    <p className="text-gray-700">
                      Wellness doesn't need a lot of time and money. It only needs{' '}
                      <span className="font-semibold text-green-700">ambition</span>. No diets,
                      excruciating gym routines only{' '}
                      <span className="font-semibold">simple lifestyle rules</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="bg-gradient-to-br from-amber-50 to-white p-8 sm:p-10 rounded-2xl
                            shadow-lg border border-amber-200 hover:shadow-2xl
                            transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 bg-amber-600 rounded-full
                                flex items-center justify-center text-black font-bold text-xl
                                shadow-lg hover:scale-110 transition-transform duration-300"
                  >
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-amber-800 mb-3">
                      Here is another secret:
                    </h3>
                    <p className="text-gray-700">
                      The{' '}
                      <span className="font-semibold text-amber-700">
                        mind and body are interlinked
                      </span>
                      . If you truly want to stay healthy, you need to take care of both. The
                      Wellness program is a{' '}
                      <span className="font-semibold">treasure of such secrets</span> and helps you
                      design your roadmap to a healthy body and mind.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-green-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center
                         tracking-tight"
            >
              Learn the secrets to
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-12">
              {benefits.map((benefit, index) => (
                <BenefitCard key={index} {...benefit} />
              ))}
            </div>

            <div className="text-center mt-12"></div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center
                         tracking-tight"
            >
              A life changing experience
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Programs Section */}
        <section className="py-20 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div
                className="group relative inline-flex items-center gap-2
                            px-5 py-2 sm:px-6 sm:py-2.5
                            bg-gradient-to-r from-amber-50 to-amber-100
                            hover:from-amber-100 hover:to-amber-200
                            text-amber-700 hover:text-amber-800 rounded-full
                            text-sm font-semibold shadow-md hover:shadow-lg
                            hover:shadow-amber-200/50 border border-amber-200/60
                            hover:border-amber-300 transition-all duration-300 ease-out
                            transform hover:scale-105 mb-4 cursor-default overflow-hidden"
                role="status"
                aria-label="Join our community"
              >
                <span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent
                               -translate-x-full group-hover:translate-x-full
                               transition-transform duration-1000 ease-in-out"
                  aria-hidden="true"
                />
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full
                                 bg-amber-400 opacity-75"
                  />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <span className="relative z-10 tracking-wide">Join Us</span>
                <svg
                  className="relative z-10 w-4 h-4 text-amber-500 opacity-70
                              group-hover:opacity-100 transition-all duration-300
                              group-hover:rotate-12 group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Upcoming Programs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the next available wellness programs near you
              </p>
            </div>

            {/* Empty State Card */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
              <div
                className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50/50
                            p-8 sm:p-12 lg:p-16 rounded-3xl shadow-xl hover:shadow-2xl
                            border border-gray-200/60 text-center
                            transition-shadow duration-500 ease-out overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full
                              blur-3xl -translate-y-1/2 translate-x-1/2"
                  aria-hidden="true"
                />
                <div
                  className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full
                              blur-3xl translate-y-1/2 -translate-x-1/2"
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 group">
                    <div
                      className="absolute inset-0 bg-green-100 rounded-full animate-ping
                                  opacity-20"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute inset-0 bg-green-100 rounded-full animate-pulse"
                      aria-hidden="true"
                    />
                    <div className="0">
                      <Calendar
                        className="w-10 h-10 sm:w-12 sm:h-12 text-green-600
                                         transition-transform duration-300 group-hover:rotate-12"
                      />
                    </div>
                  </div>

                  <h3
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4
                               bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700
                               bg-clip-text text-transparent tracking-tight"
                  >
                    No Programs Found
                  </h3>

                  <p
                    className="text-gray-600 text-base sm:text-lg mb-8 sm:mb-10
                              leading-relaxed max-w-xl mx-auto"
                  >
                    We couldn't find any programs matching your criteria. Try adjusting your search
                    or{' '}
                    <span
                      className="group relative inline-block font-semibold text-gray-800
                                   transition-colors duration-200 cursor-pointer"
                    >
                      <span className="relative z-10 text-black">register your interest</span>
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2px]
                                     bg-gradient-to-r from-green-500 to-emerald-500
                                     transform scale-x-0 group-hover:scale-x-100
                                     transition-transform duration-300 origin-left rounded-full"
                        aria-hidden="true"
                      />
                    </span>{' '}
                    to get notified about upcoming programs.
                  </p>

                  <div
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center
                                items-stretch sm:items-center"
                  >
                    <button
                      type="button"
                      className="group relative inline-flex items-center justify-center gap-2
                               px-6 py-3 sm:px-8 sm:py-3.5 bg-white hover:bg-green-50
                               text-green-700 hover:text-green-800 font-semibold
                               text-base sm:text-lg rounded-xl
                               border-2 border-green-600 hover:border-green-700
                               shadow-md hover:shadow-lg hover:shadow-green-500/20
                               transition-all duration-300 ease-out
                               transform hover:scale-[1.02] active:scale-[0.98]
                               focus:outline-none focus:ring-4 focus:ring-green-500/30
                               focus:ring-offset-2 overflow-hidden"
                      aria-label="Get notified about new programs"
                    >
                      <svg
                        className="relative z-10 w-5 h-5 transition-all duration-300
                                   group-hover:rotate-12 group-hover:scale-110"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      <span className="relative z-10">Notify Me</span>
                      <span className="relative z-10 flex h-2 w-2" aria-hidden="true">
                        <span
                          className="animate-ping absolute inline-flex h-full w-full
                                       rounded-full bg-green-400 opacity-75
                                       group-hover:opacity-100"
                        />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                      </span>
                    </button>
                    <button
                      type="button"
                      className="group relative inline-flex items-center justify-center gap-2
                               px-6 py-3 sm:px-8 sm:py-3.5 bg-white hover:bg-green-50
                               text-green-700 hover:text-green-800 font-semibold
                               text-base sm:text-lg rounded-xl
                               border-2 border-green-600 hover:border-green-700
                               shadow-md hover:shadow-lg hover:shadow-green-500/20
                               transition-all duration-300 ease-out
                               transform hover:scale-[1.02] active:scale-[0.98]
                               focus:outline-none focus:ring-4 focus:ring-green-500/30
                               focus:ring-offset-2 overflow-hidden"
                      aria-label="Get notified about new programs"
                    >
                      <svg
                        className="relative z-10 w-5 h-5 transition-all duration-300
                                   group-hover:rotate-12 group-hover:scale-110"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      ></svg>

                      <button
                        onClick={() => window.open('https://programs.vvmvp.org/', '_blank')}
                        className="bg-black text-black px-6 py-3 rounded-xl"
                      >
                        Browse all programs
                      </button>

                      <span className="relative z-10 flex h-2 w-2" aria-hidden="true">
                        <span
                          className="animate-ping absolute inline-flex h-full w-full
                                       rounded-full bg-green-400 opacity-75
                                       group-hover:opacity-100"
                        />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                      </span>
                    </button>
                  </div>

                  <p className="mt-6 text-sm text-gray-500">
                    Need help finding the right program?{' '}
                    <a
                      href="https://programs.vvmvp.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 font-medium
                                underline decoration-green-600/30 hover:decoration-green-700
                                underline-offset-2 transition-colors duration-200"
                    >
                      Contact our support team
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 via-white to-green-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div
                className="inline-block bg-green-100 text-green-700 px-6 py-2 rounded-full
                            text-sm font-semibold mb-4 hover:bg-green-200
                            transition-colors duration-300"
              >
                Have Questions?
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4
                           tracking-tight"
              >
                I want to join but...
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We've answered the most common questions to help you make the right decision
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  faq={faq}
                  index={index}
                  isOpen={openFaqIndex === index}
                  onToggle={() => toggleFaq(index)}
                />
              ))}
            </div>

            <div
              className="mt-12 text-center bg-gradient-to-r from-green-50 to-amber-50
                          p-8 rounded-2xl border border-green-100 hover:border-green-200
                          transition-all duration-300"
            >
              <p className="text-lg text-gray-700 mb-4 font-medium">
                Still have questions? We're here to help!
              </p>
              <button
                className="bg-green-600 hover:bg-green-700 text-black px-8 py-3
                               rounded-xl font-semibold text-base transition-all
                               transform hover:scale-105 shadow-lg hover:shadow-xl
                               focus:outline-none focus:ring-4 focus:ring-green-500/50"
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="py-20 sm:py-28 text-white relative bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(22, 101, 52, 0.95), rgba(21, 128, 61, 0.9)), url(https://images.unsplash.com/photo-1588286840104-8957b019727f?w=1600&q=80)',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-green-700/40" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div
              className="inline-block bg-white/20 backdrop-blur-md px-6 py-2 rounded-full
                          mb-6 border border-white/30 hover:bg-white/30
                          transition-all duration-300"
            >
              <span className="text-white text-sm font-semibold">Your Journey Starts Here</span>
            </div>

            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight
                         tracking-tight"
            >
              Ready to transform your life?
            </h2>

            <p className="text-xl sm:text-2xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed">
              Join thousands who have discovered the secrets to lasting wellness through ancient
              wisdom and modern science
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div
                className="bg-white/10 backdrop-blur-md p-6 rounded-xl border
                            border-white/20 hover:bg-white/15 transition-all duration-300
                            transform hover:scale-105"
              >
                <div className="text-4xl font-bold text-green-200 mb-2">10,000+</div>
                <div className="text-white/90">Participants</div>
              </div>
              <div
                className="bg-white/10 backdrop-blur-md p-6 rounded-xl border
                            border-white/20 hover:bg-white/15 transition-all duration-300
                            transform hover:scale-105"
              >
                <div className="text-4xl font-bold text-green-200 mb-2">2-5</div>
                <div className="text-white/90">Days Program</div>
              </div>
              <div
                className="bg-white/10 backdrop-blur-md p-6 rounded-xl border
                            border-white/20 hover:bg-white/15 transition-all duration-300
                            transform hover:scale-105"
              >
                <div className="text-4xl font-bold text-green-200 mb-2">100%</div>
                <div className="text-white/90">Natural Approach</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://programs.vvmvp.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 px-10 py-4 sm:px-12 sm:py-4
                         bg-white hover:bg-green-50 text-green-700 font-bold text-lg
                         rounded-full shadow-2xl hover:shadow-green-500/50
                         transition-all duration-300 p-3 transform hover:scale-105
                         focus:outline-none focus:ring-4 focus:ring-white/50 overflow-hidden"
                aria-label="Register for wellness programs"
              >
                <span className="relative z-10">Register Now</span>
                <svg
                  className="relative z-10 w-5 h-5 transition-transform duration-300
                              group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <button
                className="bg-green-700/80 backdrop-blur-md hover:bg-green-800
                               text-white px-10 py-4 sm:px-12 sm:py-4 rounded-full
                               font-semibold text-lg border-2 border-white/40
                               hover:border-white/60 shadow-xl p-3 transition-all
                               hover:scale-105 focus:outline-none focus:ring-4
                               focus:ring-white/30"
              >
                Express Interest
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                         text-gray-300 pt-16 pb-8"
        >
          <div className="max-w-7xl mx-auto px-4 mb-12 sm:px-6 lg:px-8">
            <div className="text-center mb-12 pb-12 border-b border-gray-700">
              <div className="flex p-4 items-center justify-center gap-3 mb-4">
                <h3 className="text-3xl font-bold text-black">Art of Living</h3>
              </div>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Creating a stress-free, violence-free, and healthy society through wellness programs
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
              <div>
                <h3 className="text-white font-bold mb-6 text-lg flex items-center">
                  <div className="w-1 h-6 bg-green-500 mr-3 rounded" />
                  Programs
                </h3>
                <ul className="space-y-3">
                  {[
                    'Happiness Programs',
                    'Corporate Program',
                    'Sahaj Samadhi Dhyana Yoga',
                    'Sri Sri Yoga Classes',
                    'Silence Retreat',
                    'Wellness Program',
                  ].map(item => (
                    <li key={item}>
                      <a
                        href="#"
                        className="hover:text-green-400 transition-colors
                                          flex items-center group"
                      >
                        <span
                          className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0
                                       group-hover:mr-2 transition-all"
                        />
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold mb-6 text-lg flex items-center">
                  <div className="w-1 h-6 bg-green-500 mr-3 rounded" />
                  Children Programs
                </h3>
                <ul className="space-y-3">
                  {[
                    'Intuition Process',
                    'Utkarsha Yoga',
                    'Medha Yoga Level 1',
                    'Medha Yoga Level 2',
                    'Colors of Joy',
                  ].map(item => (
                    <li key={item}>
                      <a
                        href="#"
                        className="hover:text-green-400 transition-colors
                                          flex items-center group"
                      >
                        <span
                          className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0
                                       group-hover:mr-2 transition-all"
                        />
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold mb-6 text-lg flex items-center">
                  <div className="w-1 h-6 bg-green-500 mr-3 rounded" />
                  Events & Ashram
                </h3>
                <ul className="space-y-3">
                  {['Events', 'Shopping', 'Facilities', 'Dining', 'Attractions'].map(item => (
                    <li key={item}>
                      <a
                        href="#"
                        className="hover:text-green-400 transition-colors
                                          flex items-center group"
                      >
                        <span
                          className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0
                                       group-hover:mr-2 transition-all"
                        />
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold mb-6 text-lg flex items-center">
                  <div className="w-1 h-6 bg-green-500 mr-3 rounded" />
                  Other Links
                </h3>
                <ul className="space-y-3 mb-8">
                  {['Contact', 'Gift a Smile', 'Scientific Research', 'Host your program'].map(
                    item => (
                      <li key={item}>
                        <a
                          href="#"
                          className="hover:text-green-400 transition-colors
                                          flex items-center group"
                        >
                          <span
                            className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0
                                       group-hover:mr-2 transition-all"
                          />
                          {item}
                        </a>
                      </li>
                    )
                  )}
                </ul>

                <div
                  className="bg-gradient-to-br from-green-900/40 to-green-800/40 p-5
                              rounded-xl border border-green-700/50 hover:border-green-600/70
                              transition-all duration-300"
                >
                  <h4 className="text-white font-bold mb-2 text-base">Get the App</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Sattva - World's #1 Free Meditation App
                  </p>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2
                                   rounded-lg text-sm font-semibold transition-all
                                   transform hover:scale-105"
                  >
                    Download Now
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t mb-10 border-gray-700 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                  <a href="#" className="hover:text-green-400 transition-colors">
                    Privacy Policy
                  </a>
                  <span className="text-gray-600">|</span>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    Cookie Policy
                  </a>
                  <span className="text-gray-600">|</span>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    Terms of Use
                  </a>
                </div>
                <p className="text-sm text-gray-400 text-center md:text-right">
                  © 2026 Art of Living International Center. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}
