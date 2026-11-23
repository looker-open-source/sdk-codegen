let
  nixpkgs = import <nixpkgs> { };
  yarn_node24 = nixpkgs.yarn.override { nodejs = nixpkgs.nodejs_24; };
in
with nixpkgs;
mkShell {
  name = "sdk-codegen";
  buildInputs = [
    nodejs_24
    yarn_node24
    jdk21
  ];
}
