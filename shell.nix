let nixpkgs = import <nixpkgs>{};
in
with nixpkgs;
with stdenv;
with stdenv.lib;
mkShell {
  name = "sdk-codegen";
  buildInputs =[nodejs-14_x];
}
