let nixpkgs = import <nixpkgs>{};
in
with nixpkgs;
with lib;
mkShell {
  name = "sdk-codegen";
  buildInputs =[nodejs-16_x yarn];
}
