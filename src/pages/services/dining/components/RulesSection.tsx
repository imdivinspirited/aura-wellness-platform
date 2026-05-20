/**
 * Dining - Rules Section
 *
 * Clear rules and guidelines for dining.
 */

import { FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RulesSectionProps {
  rules: string[];
}

export const RulesSection = ({ rules }: RulesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Dining Rules & Guidelines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> These rules help maintain the peaceful and respectful atmosphere of the dining hall. Your cooperation is appreciated.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
