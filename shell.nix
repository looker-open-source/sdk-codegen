let nixpkgs = import <nixpkgs>{};
in
with nixpkgs;
with lib;
mkShell {
  name = "sdk-codegen";
  buildInputs =[nodejs yarn jdk21];
}
