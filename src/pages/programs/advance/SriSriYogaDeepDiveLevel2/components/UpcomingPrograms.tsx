import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UpcomingProgram, Language } from '../data';

interface UpcomingProgramsProps {
  programs: UpcomingProgram[];
  onRegister: (programId: string) => void;
}

export const UpcomingPrograms = ({ programs, onRegister }: UpcomingProgramsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>('all');

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesSearch =
        searchQuery === '' ||
        program.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.language.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = languageFilter === 'all' || program.language === languageFilter;
      return matchesSearch && matchesLanguage;
    });
  }, [searchQuery, languageFilter, programs]);

  const handleRegister = (programId: string, registerUrl?: string) => {
    if (registerUrl) {
      window.open(registerUrl, '_blank', 'noopener,noreferrer');
    } else {
      onRegister(programId);
    }
  };

  return (
    <section className="py-24 bg-stone-50/30" aria-labelledby="upcoming-programs-heading">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <h2
            id="upcoming-programs-heading"
            className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900"
          >
            Upcoming Programs
          </h2>
          <p className="text-lg text-stone-700 leading-relaxed max-w-2xl mx-auto">
            Find a program that fits your schedule and location
          </p>
        </motion.div>

        {/* Filters */}
        <div className="max-w-5xl mx-auto mb-12 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" aria-hidden="true" />
            <Input
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-stone-300 bg-white"
              aria-label="Search upcoming programs"
            />
          </div>
          <Select value={languageFilter} onValueChange={(value) => setLanguageFilter(value as Language | 'all')}>
            <SelectTrigger className="w-full md:w-[200px] border-stone-300 bg-white" aria-label="Filter by language">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Tamil">Tamil</SelectItem>
              <SelectItem value="Telugu">Telugu</SelectItem>
              <SelectItem value="Kannada">Kannada</SelectItem>
              <SelectItem value="Marathi">Marathi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Program Cards */}
        {filteredPrograms.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {filteredPrograms.map((program, i) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border border-stone-200 shadow-none hover:shadow-sm bg-white transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-2 text-stone-600 mb-4">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <span className="text-sm font-medium">{program.date}</span>
                    </div>
                    <h3 className="font-display text-2xl font-light mb-3 text-stone-900">{program.name}</h3>
                    <div className="flex items-center gap-4 mb-4 text-sm text-stone-600">
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-stone-200">
                        {program.language}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        <span>{program.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm text-stone-600">{program.duration}</p>
                      {program.spots && (
                        <div className="flex items-center gap-1 text-sm text-stone-600">
                          <Users className="h-3 w-3" aria-hidden="true" />
                          <span>{program.spots} spots</span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full bg-stone-700 text-amber-50 hover:bg-stone-600 font-light"
                      onClick={() => handleRegister(program.id, program.registerUrl)}
                      aria-label={`Register for ${program.name} on ${program.date}`}
                    >
                      Register
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 max-w-2xl mx-auto">
            <p className="text-stone-600 text-lg mb-2">No programs found.</p>
            <p className="text-stone-500 text-sm">Please change your search criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
};
