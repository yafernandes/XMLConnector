<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
	<xsl:output method="text" omit-xml-declaration="yes" indent="no" encoding="utf-8"/>
	<xsl:param name="delim" select="','" />
	<xsl:param name="quote" select="'&quot;'" />
	<xsl:param name="linebreak" select="'&#xA;'" />
	<xsl:param name="delimiter" select="','" />
	<xsl:template match="/">
		<xsl:param name="FIRST_FILE"/>
		<xsl:if test="$FIRST_FILE='true'">TagName,Status,TagValue,TimeStamp
</xsl:if>
		<xsl:for-each select="//HistoricalTextData">
			<xsl:value-of
				select="concat(TagName, $delimiter, Status, $delimiter, TagValue, $delimiter, TimeStamp, $linebreak)" />
		</xsl:for-each>
	</xsl:template>
</xsl:stylesheet>