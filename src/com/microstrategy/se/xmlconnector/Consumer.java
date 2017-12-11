package com.microstrategy.se.xmlconnector;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;

/**
 * Servlet implementation class Consumer
 */
@WebServlet("/consume")
public class Consumer extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static Logger logger = Logger.getLogger(Consumer.class.getName());
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Consumer() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String uuid = request.getParameter("uuid");
		logger.info("Retriving dataset " + uuid);
		File csvFile = Uploader.getStorageDirectory().toPath().resolve(uuid).toFile();
		if (!csvFile.exists()) {
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		IOUtils.copy(new FileInputStream(csvFile), response.getOutputStream());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
