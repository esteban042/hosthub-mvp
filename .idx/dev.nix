{ pkgs, ... }: {
  channel = "unstable";
  packages = [
    pkgs.nodejs_24
    pkgs.npm-check-updates
  ];
  env = {};
  services = {};
}
