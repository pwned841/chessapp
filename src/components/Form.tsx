'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Form() {
    const test = () => {
        console.log("test");
    };

    return (
        <>
            <Input />
            <Input />
            <Button variant="outline" onClick={test}>
                Search for this player
            </Button>
        </>
    );
}
