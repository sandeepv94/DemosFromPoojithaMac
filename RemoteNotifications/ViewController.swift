//
//  ViewController.swift
//  RemoteNotifications
//
//  Created by Peoplelink on 1/10/20.
//  Copyright © 2020 Peoplelink. All rights reserved.
//

import UIKit
import Alamofire

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
    }

    @IBAction func sendNotificationTapped(_ sender: UIButton) {
        
//        let params = ["username":"john", "password":"123456"] as Dictionary<String, String>
//
//        var request = URLRequest(url: URL(string: "http://localhost:8080/api/1/login")!)
//        request.httpMethod = "GET"
//        request.httpBody = try? JSONSerialization.data(withJSONObject: params, options: [])
//        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
//
//        let session = URLSession.shared
//        let task = session.dataTask(with: request, completionHandler: { data, response, error -> Void in
//            print(response!)
//            do {
//                let json = try JSONSerialization.jsonObject(with: data!) as! Dictionary<String, AnyObject>
//                print(json)
//            } catch {
//                print("error")
//            }
//        })
//
//        task.resume()

        guard let url = URL(string: "http://172.16.16.180:8000/getdata") else { return print("url is wrong") }
        Alamofire.request(url, method: .get, parameters: nil, encoding: JSONEncoding.default, headers: nil).responseJSON { (response) in
            print(response)
        }
    }
    
}

