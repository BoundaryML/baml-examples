{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    # pkgs.python313Packages.uvicorn
    (pkgs.python311.withPackages (ps: with ps; [
        ps.uvicorn
    ]))
    pkgs.uv
    pkgs.nodejs
    pkgs.pnpm
    pkgs.concurrently
    
  ];
}