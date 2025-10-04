import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

export default function CourseCardSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="animate-pulse shadow-none border-none">
          <CardHeader className="pb-4">
            <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden" />
            <Badge className="w-fit bg-gray-300 text-transparent">Loading</Badge>
            <CardTitle className="text-lg bg-gray-200 h-5 w-3/4 rounded mt-2" />
            <CardDescription className="line-clamp-2 bg-gray-200 h-4 w-full rounded mt-1" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm bg-gray-200 h-4 w-16 rounded" />
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1 bg-gray-200 text-transparent pointer-events-none">
                <Eye className="h-3 w-3 mr-1" /> Loading
              </Button>
              <Button size="sm" variant="outline" className="flex-1 bg-gray-200 text-transparent pointer-events-none">
                <Edit className="h-3 w-3 mr-1" /> Loading
              </Button>
              <Button size="sm" variant="outline" className="bg-gray-200 text-transparent pointer-events-none">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
