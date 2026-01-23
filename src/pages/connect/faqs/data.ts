// ==================== TYPE DEFINITIONS ====================
export type FAQCategory =
  | 'visa-travel'
  | 'airport-routing'
  | 'health-medical'
  | 'cultural'
  | 'financial-payment'
  | 'refunds-cancellation'
  | 'code-conduct'
  | 'general';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  important?: boolean;
}

export interface FAQCategoryInfo {
  id: FAQCategory;
  label: string;
  description: string;
  icon: string; // Icon name from lucide-react
}

export interface FAQsPageData {
  categories: FAQCategoryInfo[];
  faqs: FAQ[];
  volunteerContact: {
    label: string;
    phone: string;
    email: string;
    hours: string;
  };
}

// ==================== FAQS PAGE DATA ====================
export const faqsPageData: FAQsPageData = {
  categories: [
    {
      id: 'visa-travel',
      label: 'Visa & Travel',
      description: 'Information about visas and travel requirements',
      icon: 'Plane',
    },
    {
      id: 'airport-routing',
      label: 'Airport → Ashram',
      description: 'How to reach the ashram from the airport',
      icon: 'MapPin',
    },
    {
      id: 'health-medical',
      label: 'Health & Medical',
      description: 'Medical assistance and health-related information',
      icon: 'Heart',
    },
    {
      id: 'cultural',
      label: 'Cultural Considerations',
      description: 'Cultural norms and practices',
      icon: 'Users',
    },
    {
      id: 'financial-payment',
      label: 'Financial & Payment',
      description: 'Payment methods and financial information',
      icon: 'CreditCard',
    },
    {
      id: 'refunds-cancellation',
      label: 'Refunds & Cancellation',
      description: 'Refund and cancellation policies',
      icon: 'RotateCcw',
    },
    {
      id: 'code-conduct',
      label: 'Code of Conduct',
      description: 'Expected behavior and guidelines',
      icon: 'Shield',
    },
    {
      id: 'general',
      label: 'General FAQs',
      description: 'General questions and answers',
      icon: 'HelpCircle',
    },
  ],
  faqs: [
    // Visa & Travel
    {
      id: 'visa-1',
      question: 'Do I need a visa to visit India for the program?',
      answer:
        'Yes, most foreign nationals require a visa to enter India. You should apply for a tourist visa at your nearest Indian embassy or consulate. The process typically takes 2-4 weeks. For some countries, e-visa options are available. Please check the official Indian government website for the most current visa requirements based on your nationality.',
      category: 'visa-travel',
      important: true,
    },
    {
      id: 'visa-2',
      question: 'What type of visa should I apply for?',
      answer:
        'You should apply for a Tourist Visa. This allows you to participate in programs and stay at the ashram. The duration of your visa should cover your entire stay, including travel time. We recommend applying for a visa that is valid for at least 30 days longer than your intended stay to account for any delays or extensions.',
      category: 'visa-travel',
    },
    {
      id: 'visa-3',
      question: 'How long does it take to get an Indian visa?',
      answer:
        'Visa processing times vary by country and embassy. Typically, it takes 2-4 weeks for standard processing. Some embassies offer expedited services for an additional fee. E-visas, if available for your country, can be processed in 3-5 business days. We strongly recommend applying at least 6-8 weeks before your intended travel date.',
      category: 'visa-travel',
    },

    // Airport → Ashram
    {
      id: 'airport-1',
      question: 'How do I reach the ashram from Bangalore Airport?',
      answer:
        'The ashram is approximately 45 km from Kempegowda International Airport (BLR). You can take a taxi (Ola, Uber, or Meru) which costs approximately ₹1,500-₹2,500. Alternatively, you can arrange for airport pickup through our booking assistance team by calling +91-80-2843-2000. The journey typically takes 1.5-2 hours depending on traffic.',
      category: 'airport-routing',
      important: true,
    },
    {
      id: 'airport-2',
      question: 'Is airport pickup available?',
      answer:
        'Yes, airport pickup can be arranged. Please contact our booking assistance team at +91-80-2843-2000 or email bookings@artofliving.org at least 48 hours before your arrival. Provide your flight details (flight number, arrival time, terminal) and we will arrange for a representative to meet you at the airport.',
      category: 'airport-routing',
    },
    {
      id: 'airport-3',
      question: 'What is the best way to reach the ashram from the city center?',
      answer:
        'From Bangalore city center, you can take BMTC A/C buses (routes 335, 335A, 335B, 335C) which run every 30-45 minutes. The journey takes approximately 1.5-2 hours. You can also take a taxi or book a private car. The ashram is located on Kanakapura Road, about 21 km from the city.',
      category: 'airport-routing',
    },

    // Health & Medical
    {
      id: 'health-1',
      question: 'What medical facilities are available at the ashram?',
      answer:
        'The ashram has a basic medical facility with a doctor available during certain hours. For serious medical emergencies, we coordinate with nearby hospitals. We recommend bringing any prescription medications you need, as specific medications may not be readily available. Please inform us of any medical conditions or special requirements before your arrival.',
      category: 'health-medical',
      important: true,
    },
    {
      id: 'health-2',
      question: 'Do I need any vaccinations before coming to India?',
      answer:
        'We recommend consulting with your healthcare provider or a travel medicine clinic at least 4-6 weeks before your trip. Common recommendations include vaccinations for Hepatitis A & B, Typhoid, and ensuring your routine vaccinations (MMR, Tetanus, etc.) are up to date. Malaria prophylaxis may be recommended depending on your travel plans.',
      category: 'health-medical',
    },
    {
      id: 'health-3',
      question: 'What should I do if I have a medical emergency?',
      answer:
        'In case of a medical emergency, immediately inform the ashram staff or call the emergency number provided at check-in. We have arrangements with nearby hospitals for emergency care. For serious emergencies, call 108 (ambulance) or 102 (medical emergency). Always carry your travel insurance information with you.',
      category: 'health-medical',
    },

    // Cultural Considerations
    {
      id: 'cultural-1',
      question: 'What should I wear at the ashram?',
      answer:
        'Modest, comfortable clothing is recommended. For meditation and programs, loose-fitting clothes that cover shoulders and knees are appropriate. Avoid revealing or tight-fitting clothing. Traditional Indian attire is welcome but not required. We recommend bringing comfortable walking shoes and a shawl or light jacket for cooler evenings.',
      category: 'cultural',
    },
    {
      id: 'cultural-2',
      question: 'Are there any cultural customs I should be aware of?',
      answer:
        'The ashram follows traditional Indian customs. It is customary to remove shoes before entering meditation halls and certain areas. Respectful behavior, quiet during meditation times, and following the ashram schedule are appreciated. Photography may be restricted in certain areas. We encourage an open mind and respect for the spiritual environment.',
      category: 'cultural',
    },
    {
      id: 'cultural-3',
      question: 'What language is used in the programs?',
      answer:
        'Programs are conducted in multiple languages including English, Hindi, and regional languages. Most programs have English-speaking facilitators. Please check the program details or contact us to confirm the language of instruction for your specific program. Translation services may be available for some programs.',
      category: 'cultural',
    },

    // Financial & Payment
    {
      id: 'financial-1',
      question: 'What payment methods are accepted?',
      answer:
        'We accept cash (Indian Rupees), credit/debit cards (Visa, Mastercard), and online bank transfers. Some international cards may have restrictions, so we recommend carrying cash or using a local bank account if possible. UPI payments (PhonePe, Google Pay) are also accepted. Please note that foreign currency is not accepted directly.',
      category: 'financial-payment',
    },
    {
      id: 'financial-2',
      question: 'Can I pay in foreign currency?',
      answer:
        'No, we do not accept foreign currency directly. You will need to exchange your currency to Indian Rupees (INR) at the airport, a bank, or authorized currency exchange centers. ATMs are available at the airport and in nearby areas. We recommend exchanging some currency at the airport for immediate needs.',
      category: 'financial-payment',
    },
    {
      id: 'financial-3',
      question: 'What is the contribution amount for programs?',
      answer:
        'Contribution amounts vary by program and duration. Your contribution supports the program, accommodation, meals, and helps fund social projects. Please check the specific program page or contact our booking team at +91-80-2843-2000 for current contribution amounts. We offer various accommodation options to suit different budgets.',
      category: 'financial-payment',
    },

    // Refunds & Cancellation
    {
      id: 'refund-1',
      question: 'What is the cancellation policy?',
      answer:
        'Cancellations made 7 days or more before the program start date are eligible for a full refund minus a small processing fee. Cancellations made 3-6 days before receive a 50% refund. Cancellations made less than 3 days before the program start date are not eligible for a refund. In case of medical emergencies or visa issues, please contact us for special consideration.',
      category: 'refunds-cancellation',
      important: true,
    },
    {
      id: 'refund-2',
      question: 'How long does it take to process a refund?',
      answer:
        'Refunds are typically processed within 7-14 business days after approval. The refund will be issued to the original payment method used. For international transactions, it may take additional time depending on your bank. You will receive an email confirmation once the refund has been processed.',
      category: 'refunds-cancellation',
    },
    {
      id: 'refund-3',
      question: 'Can I transfer my booking to another person?',
      answer:
        'Yes, in most cases, you can transfer your booking to another person. Please contact our booking team at least 3 days before the program start date with the new participant\'s details. A small transfer fee may apply. Transfers are subject to availability and program-specific terms.',
      category: 'refunds-cancellation',
    },

    // Code of Conduct
    {
      id: 'conduct-1',
      question: 'What is expected behavior at the ashram?',
      answer:
        'We expect all participants to maintain a respectful, peaceful, and mindful environment. This includes: arriving on time for sessions, maintaining silence in designated areas, respecting others\' privacy and space, following the ashram schedule, and refraining from alcohol, smoking, and non-vegetarian food on the premises. Mobile phones should be on silent mode during programs.',
      category: 'code-conduct',
      important: true,
    },
    {
      id: 'conduct-2',
      question: 'Are there any restrictions on photography?',
      answer:
        'Photography is generally allowed in public areas, but may be restricted during meditation sessions, in certain halls, or in areas where privacy is important. Please respect signs indicating no photography zones and always ask permission before photographing other participants. Commercial photography requires prior approval.',
      category: 'code-conduct',
    },
    {
      id: 'conduct-3',
      question: 'What should I do if I have concerns or issues?',
      answer:
        'If you have any concerns or issues during your stay, please approach the program coordinators or ashram management. We have a dedicated support team available to assist you. For urgent matters, contact the volunteer helpline at +91-80-2843-2100. We are committed to ensuring a positive experience for all participants.',
      category: 'code-conduct',
    },

    // General FAQs
    {
      id: 'general-1',
      question: 'What should I bring with me?',
      answer:
        'Essential items include: comfortable clothing (modest, covering shoulders and knees), toiletries, any prescription medications, a water bottle, comfortable walking shoes, a flashlight, insect repellent, and a shawl or light jacket. Bedding and towels are provided. We recommend bringing a notebook for journaling during the program.',
      category: 'general',
    },
    {
      id: 'general-2',
      question: 'Is Wi-Fi available at the ashram?',
      answer:
        'Limited Wi-Fi is available in common areas, but we encourage participants to minimize internet usage during programs to fully immerse in the experience. The connection may be slower than urban standards. Mobile data networks (4G) are generally available, though signal strength may vary in some areas.',
      category: 'general',
    },
    {
      id: 'general-3',
      question: 'What kind of accommodation is available?',
      answer:
        'We offer various accommodation options including shared rooms, private rooms, and dormitory-style accommodations. All rooms are clean and comfortable with basic amenities. Accommodation is assigned based on availability and your contribution level. Please specify your preference when booking, and we will do our best to accommodate.',
      category: 'general',
    },
    {
      id: 'general-4',
      question: 'What meals are provided?',
      answer:
        'Vegetarian meals are provided three times daily (breakfast, lunch, dinner) as part of your program contribution. The food is traditional Indian vegetarian cuisine, prepared with care and following yogic dietary principles. Special dietary requirements (vegan, gluten-free, etc.) can be accommodated with prior notice. Please inform us of any allergies or dietary restrictions when booking.',
      category: 'general',
    },
    {
      id: 'general-5',
      question: 'Can I extend my stay after the program?',
      answer:
        'Yes, subject to availability, you can extend your stay. Please inform the ashram management at least 2 days before your scheduled departure. Additional charges will apply for extended accommodation and meals. We recommend checking availability in advance, especially during peak seasons.',
      category: 'general',
    },
  ],
  volunteerContact: {
    label: 'Volunteer Helpline',
    phone: '+91-80-2843-2100',
    email: 'volunteers@artofliving.org',
    hours: 'Available 24/7 for emergencies, regular hours: 7:00 AM - 9:00 PM IST',
  },
};
