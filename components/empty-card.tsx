import { InboxIcon } from "lucide-react"
/**
 * EmptyCard component displays a card with an inbox icon and "No data available" message.
 * Used to indicate when a data set or query result is empty.
 *
 * @component
 * @returns {JSX.Element} A card component with an inbox icon and message
 */
import { Card, CardContent } from "@/components/ui/card"

export default function EmptyCard() {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="mb-4">
          <InboxIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">
          No data available
        </p>
      </CardContent>
    </Card>
  )
}
