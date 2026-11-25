import { MOBILE, useMediaQuery } from "@/hooks/use-media-query";

export function useIsMobile() {
	return useMediaQuery(MOBILE);
}
