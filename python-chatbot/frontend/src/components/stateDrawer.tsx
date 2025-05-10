"use client"

import { Minus, Plus } from "lucide-react"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { State } from "../baml_client"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function StateDrawer(props: {state: State}) {

    return (
        <Drawer>
            <DrawerTrigger>
                <Button>
                    <Plus />
                </Button>
            </DrawerTrigger>
        </Drawer>
            
    )
}