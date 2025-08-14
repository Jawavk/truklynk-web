import { Card } from "@/components/ui/layout/Card"
import { cn } from "@/utils/cn"

export const renderTitleCard = (title, count, className) => {
        return <Card className={cn("w-64 h-24 hover:bg-gray-800 text-black rounded-md p-4 ", className)}>
            <h1 className="text-lg text-white font-medium">{title}</h1>
            <p className="text-white text-2xl font-bold mt-2">{count}</p>
        </Card>
    }