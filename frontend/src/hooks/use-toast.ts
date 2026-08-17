import { toast as baseUiToast } from "@/components/ui/toast"

export const toast = (props: any) => {
  return baseUiToast.add(props);
}

export const useToast = () => {
  return { toast }
}
