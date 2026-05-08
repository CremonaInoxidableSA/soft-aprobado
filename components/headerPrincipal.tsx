import { ThemeSwitcher } from "@/components/theme/themeSwitcher";
import Link from "next/link";
import Image from "next/image";

import Logo from "@/public/logo/creminox_innovate.webp";

export const HeaderPrincipal = () => {
  return (
    <header className="flex bg-header-bg text-texto-header p-5">
      <div className="flex flex-row h-full w-[30%] justify-start gap-7 items-center">
        <div className="flex items-center justify-center cursor-pointer">
          <ThemeSwitcher />
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/"
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            Inventario
          </Link>
          <Link
            href="/gestion"
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            Gestión
          </Link>
        </nav>
      </div>

      <p className="flex w-[40%] justify-center font-bold items-center">
        Control de Software Aprobado
      </p>

      <div className="flex flex-row w-[30%] justify-end items-center">
        <ul className="flex flex-row w-full h-full gap-7 justify-end">
          <Link
            href="https://creminox.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              src={Logo}
              alt="Creminox logo"
              className="h-6 w-auto"
              priority
              loading="eager"
            />
          </Link>
        </ul>
      </div>
    </header>
  );
};

export default HeaderPrincipal;
