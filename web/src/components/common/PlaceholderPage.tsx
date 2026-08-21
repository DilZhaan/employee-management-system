import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/PageContainer";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <PageContainer title={title} description={description}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>This workspace is ready for the related business workflow.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-slate-600">
          The routing, authorization checks, and shell placement are active. Data views and editing workflows will be added separately.
        </CardContent>
      </Card>
    </PageContainer>
  );
}
