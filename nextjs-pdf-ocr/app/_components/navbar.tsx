"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NavBar = () => {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <div className="">
      <div
        className="flex flex-row w-full h-[50px] px-4 border-b-[1px] border-b-primary/10 "
        aria-label="Global"
      >
        <div className="flex w-1/3">
          {" "}
          {pathname !== "/" && (
            <Link className={buttonVariants({ variant: "ghost" })} href="/">
              {"More examples"}
            </Link>
          )}
        </div>
        <div className="text-muted-foreground flex items-center justify-center  text-center w-1/3 whitespace-nowrap">
          These examples are built with{" "}
          <Link
            href={"https://docs.boundaryml.com"}
            className="px-1 underline text-blue-600"
            target="_blank"
          >
            {" "}
            BAML
          </Link>{" "}
        </div>
        <div className="flex lg:hidden">
          {/* <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button> */}
        </div>
        <div className="hidden lg:flex lg:gap-x-12 justify-end items-center w-[33%]">
          <>
            {/* {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-base font-light leading-6 text-gray-600"
                >
                  {item.name}
                </a>
              ))} */}
          </>
          <Link
            className="flex flex-row items-center gap-x-2 text-base font-light leading-6 text-gray-700 hover:text-gray-500"
            href="https://github.com/boundaryml/baml"
          >
            <Image src="/github-mark.svg" width={20} height={20} alt="Github" />
            <div>Star us on Github</div>
          </Link>
          <Link
            className="flex flex-row gap-x-2 text-base font-light leading-6 text-gray-700 hover:text-gray-500"
            href="https://discord.gg/yzaTpQ3tdT"
          >
            <Image
              src="/discord-icon.svg"
              width={20}
              height={20}
              alt="Discord community"
            />
            <div>Join the community</div>
          </Link>
        </div>
      </div>
    </div>
  );
};
