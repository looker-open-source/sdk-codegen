let nixpkgs = import <nixpkgs>{};
in
with nixpkgs;
with lib;
mkShell {
  name = "sdk-codegen";
  buildInputs =[nodejs-14_x yarn];
}
