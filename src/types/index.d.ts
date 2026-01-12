declare type Param = string | string[] | undefined
declare type SearchParamProps = {
	params: Promise<{ [key: string]: string }>
	searchParams: Promise<{ [key: string]: Param }>
}
