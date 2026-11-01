# The TypeScript sources live alongside the .proto files in each package
# directory, rather than in "src".
JS_SOURCE_FILES += $(shell PATH="$(PATH)" git-find . -path '*/*' -name '*.ts' -not -name '*.test.ts')

# Run tsc and vitest after all generated files are up-to-date, and check the
# package once it has been built. These variables must be set before the
# makefiles.dev makefiles are included.
JS_TSC_REQ += $$(GENERATED_FILES)
JS_VITEST_REQ += $$(GENERATED_FILES)
JS_PUBLINT_REQ += artifacts/dist

-include .makefiles/Makefile
-include .makefiles/pkg/protobuf/v2/Makefile
-include .makefiles/pkg/protobuf/v2/with-primo.mk
-include .makefiles/pkg/go/v1/Makefile
-include .makefiles/pkg/js/v1/Makefile
-include .makefiles/pkg/js/v1/with-pnpm.mk
-include .makefiles/pkg/js/v1/with-tsc.mk
-include .makefiles/pkg/js/v1/with-publint.mk
-include .makefiles/pkg/vscode/v1/Makefile
-include .makefiles/pkg/changelog/v2/Makefile

# TODO: Add these lines once arethetypeswrong runs under pnpm, and include
# .makefiles/pkg/js/v1/with-arethetypeswrong.mk above:
# https://github.com/make-files/makefiles/pull/149
#
#   JS_ARETHETYPESWRONG_REQ += artifacts/dist

# TODO: Remove this rule once with-tsc.mk provides it:
# https://github.com/make-files/makefiles/pull/148
artifacts/dist: tsconfig.build.json tsconfig.json artifacts/link-dependencies.touch $(JS_SOURCE_FILES) $(JS_TSC_REQ)
	@rm -rf "$@"
	$(JS_EXEC) tsc -p "$<"
	@touch "$@"

.makefiles/%:
	@curl -sfL https://makefiles.dev/v1 | bash /dev/stdin "$@"
