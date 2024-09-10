let nixpkgs = import <nixpkgs>{};
in
with nixpkgs;
with lib;
mkShell {
  name = "sdk-codegen";
  buildInputs =[nodejs_22 yarn];
}
