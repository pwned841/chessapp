import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function CardHome() {
    return (
        <Card className="w-[850px]">
            <CardHeader className="text-center text-5xl">
                <CardTitle>Search a player</CardTitle>
                <CardDescription>Enter the first name and last name of the player you are looking for.</CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="First name">First Name</Label>
                            <Input id="first_name" placeholder="First name"/>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input id="last_name" placeholder="Last name"/>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="framework">Chess Website</Label>
                            <Select>
                                <SelectTrigger id="framework">
                                    <SelectValue placeholder="Select"/>
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="next">Chess.com</SelectItem>
                                    <SelectItem value="sveltekit">Lichess.org</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" disabled className="cursor-no-drop" >Cancel</Button>
                <Button>Show Analytics</Button>
            </CardFooter>
        </Card>
    )
}
