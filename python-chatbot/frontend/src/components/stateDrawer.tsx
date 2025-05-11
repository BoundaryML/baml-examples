"use client"

import { Minus, Plus } from "lucide-react"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "../components/ui/drawer"
import { State } from "../baml_client"
import { Button } from "../components/ui/button"
import { useState } from "react"

export default function StateDrawer(props: {state: State}) {

    return (
        <Drawer>
            <DrawerTrigger>
                <div>
                    <span>Debug</span>
                </div>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerClose>
                    <div>Close</div>
                </DrawerClose>
                <DrawerHeader>
                    <DrawerTitle>State</DrawerTitle>
                </DrawerHeader>
                <pre className="text-xs">
                    {JSON.stringify(props.state, null, 2)}
                </pre>
            </DrawerContent>
        </Drawer>
            
    )
}