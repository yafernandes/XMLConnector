package com.microstrategy.se.xmlconnector;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Result;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.TransformerFactoryConfigurationError;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

/**
 * Servlet implementation class Uploader
 */
@WebServlet("/upload")
public class Uploader extends HttpServlet {

	private static final String SERVLET_PARAM_UUID = "uuid";
	private static final String SERVLET_PARAM_STYLESHEET = "stylesheet";

	static final String FIRST_FILE = "FIRST_FILE";

	static private File tempDirectory;

	private static final long serialVersionUID = 1L;

	private static Logger logger = Logger.getLogger(Uploader.class.getName());

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public Uploader() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	static File getStorageDirectory() throws IOException {
		if (tempDirectory == null) {
			tempDirectory = Files.createTempDirectory("xml2csv").toFile();
			logger.info("Storage directory is " + tempDirectory);
		}
		if (!tempDirectory.exists()) {
			tempDirectory.mkdirs();
		}
		return tempDirectory;
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		boolean isMultipart = ServletFileUpload.isMultipartContent(request);
		if (isMultipart) {
			
			String stylesheet = request.getParameter(SERVLET_PARAM_STYLESHEET);
			String uuid = request.getParameter(SERVLET_PARAM_UUID);

			if (uuid == null || stylesheet == null) {
				response.setStatus(HttpServletResponse.SC_PRECONDITION_FAILED);
				return;
			}
			
			// UUID should only have letters, numbers, and -
			if (uuid.matches(".*[^\\w-].*")) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}

			File stylesheetFile = new File(getServletContext().getRealPath("WEB-INF/stylesheets/" + stylesheet));
			
			if (!stylesheetFile.exists()) {
				response.setStatus(HttpServletResponse.SC_NOT_IMPLEMENTED);
				return;
			}

			File csvFile = getStorageDirectory().toPath().resolve(uuid).toFile();
			csvFile.deleteOnExit();

			OutputStream outputStream = new FileOutputStream(csvFile, true);

			try {

				DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
				DocumentBuilder builder = factory.newDocumentBuilder();
				StreamSource stylesource = new StreamSource(stylesheetFile);
				Transformer transformer = TransformerFactory.newInstance().newTransformer(stylesource);
				Result result = new StreamResult(outputStream);
				ServletFileUpload upload = new ServletFileUpload();
				FileItemIterator iter;
				iter = upload.getItemIterator(request);
				boolean isFirstFile = true;
				while (iter.hasNext()) {
					transformer.setParameter(FIRST_FILE, Boolean.toString(isFirstFile));
					FileItemStream item = iter.next();
					if (!item.isFormField()) {
						Document document = builder.parse(item.openStream());
						Source source = new DOMSource(document);
						transformer.transform(source, result);
					}
					isFirstFile = false;
				}
				outputStream.close();
			} catch (ParserConfigurationException e) {
				e.printStackTrace();
				throw new ServletException(e);
			} catch (SAXException e) {
				e.printStackTrace();
				throw new ServletException(e);
			} catch (TransformerException e) {
				e.printStackTrace();
				throw new ServletException(e);
			} catch (FileUploadException e) {
				e.printStackTrace();
				throw new ServletException(e);
			} catch (TransformerFactoryConfigurationError e) {
				e.printStackTrace();
				throw new ServletException(e);
			} finally {
				outputStream.close();
			}
		}
	}

}
