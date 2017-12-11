<?xml version="1.0"?>
<!--  https://catalog.data.gov/dataset/demographic-statistics-by-zip-code-acfc9  -->
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
	<xsl:output method="text" omit-xml-declaration="yes" indent="no" encoding="utf-8"/>
	<xsl:param name="delim" select="','" />
	<xsl:param name="quote" select="'&quot;'" />
	<xsl:param name="linebreak" select="'&#xA;'" />
	<xsl:param name="delimiter" select="','" />
	<xsl:template match="/response">
		<xsl:param name="FIRST_FILE"/>
		<!-- First line should include line breaker -->
		<xsl:if test="$FIRST_FILE='true'">ZipCode,females,males
</xsl:if>
		<xsl:for-each select="//row/row">
			<xsl:value-of
				select="concat(jurisdiction_name, $delimiter, count_female, $delimiter, count_male, $linebreak)" />
		</xsl:for-each>
	</xsl:template>
</xsl:stylesheet>