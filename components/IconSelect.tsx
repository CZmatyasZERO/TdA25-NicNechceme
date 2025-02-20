import { Group, Select, CheckIcon } from "@mantine/core"
import type { SelectProps } from "@mantine/core"

export default function IconSelect({ icons, ...selectProps }: { icons: Record<string, React.ReactNode> } & SelectProps) {
  const iconProps = {
    color: "currentColor",
    opacity: 0.6,
    size: 18,
  }
  const renderSelectOption: SelectProps["renderOption"] = ({ option, checked }) => (
    <Group flex="1" gap="xs">
      {icons[option.value]}
      {option.label}
      {checked && <CheckIcon style={{ marginInlineStart: "auto" }} {...iconProps} />}
    </Group>
  )

  return <Select renderOption={renderSelectOption} {...selectProps} />
}
