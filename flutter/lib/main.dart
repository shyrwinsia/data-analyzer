import 'dart:html';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(DataAnalyzer());
}

class DataAnalyzer extends StatefulWidget {
  @override
  _DataAnalyzerState createState() => _DataAnalyzerState();
}

class _DataAnalyzerState extends State<DataAnalyzer> {
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: new ThemeData(
        primarySwatch: Colors.blue,
        primaryColor: const Color(0xFF2196f3),
        accentColor: const Color(0xFF2196f3),
        canvasColor: const Color(0xFFfafafa),
        textTheme: GoogleFonts.notoSansTextTheme(Theme.of(context).textTheme),
      ),
      home: _buildPage(),
    );
  }

  Widget _buildPage() {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              "Stafftronix Data Analytics",
              style: TextStyle(fontSize: 32, color: Colors.grey.shade600),
            ),
            SizedBox(height: 12),
            RaisedButton(
              onPressed: getFile,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.upload_sharp),
                  SizedBox(width: 8),
                  Text('Upload file'),
                ],
              ),
            ),
            _loaded ? Text('No file') : Text('some File'),
          ],
        ),
      ),
    );
  }

  void getFile() async {
    InputElement uploadInput = FileUploadInputElement();
    uploadInput.click();
    uploadInput.onChange.listen((e) {
      final reader = FileReader();
      reader.onLoadEnd.listen((e) {
        print(reader.result.toString());
      });
    });

    uploadInput.remove();
  }
}
