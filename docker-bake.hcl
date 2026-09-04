variable "SANDBOX_IMAGE" {
  default = "harbor.17usoft.com/bx/base/bx-agent-sandbox:latest"
}

group "default" {
  targets = ["agent-sandbox"]
}

target "agent-sandbox" {
  context = "."
  dockerfile = "docker/sandbox.Dockerfile"
  tags = [SANDBOX_IMAGE]
  platforms = ["linux/amd64", "linux/arm64"]
}
