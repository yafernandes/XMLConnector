package com.microstrategy.se.xmlconnector;

import java.io.File;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Result;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.w3c.dom.Document;


// Simple code to test the XSL
public class Tester {

	public static void main(String[] args) throws Exception {
		File xmlFile = new File(args[0]);
		File xslFile = new File(args[1]);

		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder = factory.newDocumentBuilder();
		StreamSource stylesource = new StreamSource(xslFile);
		Transformer transformer = TransformerFactory.newInstance().newTransformer(stylesource);
		transformer.setParameter(Uploader.FIRST_FILE, Boolean.TRUE.toString());
		Result result = new StreamResult(System.out);
		Document document = builder.parse(xmlFile);
		Source source = new DOMSource(document);
		transformer.transform(source, result);
	}

}
